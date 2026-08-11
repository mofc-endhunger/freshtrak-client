import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import SearchComponent, { SearchFormData } from '../General/SearchComponent';
import ResourceListComponent from './ResourceListComponent';
import EventListContainer from './EventListContainer';
import { API_URL } from '../../Utils/Urls';
import { setCurrentZip } from '../../Store/Search/searchSlice';
import axios from 'axios';
import '../../Assets/scss/main.scss';
import { DEFAULT_DISTANCE } from '../../Utils/Constants';
import serviceCatFilter from '../../Utils/serviceCatFilter';
import LoadingSpinner from '../General/LoadingSpinner';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { ExternalAgency } from './types/externalAgency.types';
import localization from '../Localization/LocalizationComponent';

// Number of events to render per batch for progressive loading
const EVENTS_PER_BATCH = 30;

// Upper bound on how long a search may stay in its loading state. axios has no
// default timeout, so without this a request that never settles leaves the page
// showing "Searching..." indefinitely with no way for the user to tell that
// anything is wrong. Sized well above observed latency (~5s for api/agencies
// under normal load) so it only trips on a genuine stall, not a slow response.
const REQUEST_TIMEOUT_MS = 20_000;

interface Agency {
  id: string;
  name: string;
  nickname: string;
  events: any[];
  [key: string]: any;
}

interface FoodBankData {
  foodbanks: any[];
  [key: string]: any;
}

const EventContainer: React.FC = () => {
  const {
    zipCode = '',
    distance = DEFAULT_DISTANCE,
    serviceCat,
  } = useParams<{
    zipCode?: string;
    distance?: string;
    serviceCat?: string;
  }>();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  // Default to "next_7_days" to show events from today plus 7 days
  // Map old "this_week" value to "next_7_days" for backward compatibility
  const availabilityParam = searchParams.get('availability');
  const availability =
    availabilityParam === 'this_week' || !availabilityParam ? 'next_7_days' : availabilityParam;
  const reservations = searchParams.get('reservations') === 'true';

  const [foodBankResponse, setFoodBankResponse] = useState<boolean>(false);
  const [foodBankData, setFoodBankData] = useState<FoodBankData>({
    foodbanks: [],
  });

  const [serverError, setServerError] = useState<boolean>(false);
  // Distinct from `serverError`, which reports a foodbank-lookup failure. This
  // tracks the events search itself so a failed search surfaces an error and a
  // retry instead of silently rendering an empty result set.
  const [eventsError, setEventsError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [agencyData, setAgencyData] = useState<Agency[]>([]);
  const [filteredData, setFilteredData] = useState<Agency[]>([]);
  const [zip, setZip] = useState<string | null>(null);
  const [externalAgencies, setExternalAgencies] = useState<ExternalAgency[]>([]);

  // Progressive rendering state - track number of events to show
  const [visibleEventCount, setVisibleEventCount] = useState<number>(EVENTS_PER_BATCH);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMoreEvents, setHasMoreEvents] = useState<boolean>(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = serviceCatFilter(filteredData);

  // Load more events handler for infinite scroll
  const loadMoreEvents = useCallback(() => {
    if (loadingMore) return;

    setLoadingMore(true);
    // Use setTimeout to simulate async loading and allow UI to update
    setTimeout(() => {
      setVisibleEventCount((prev) => prev + EVENTS_PER_BATCH);
      setLoadingMore(false);
    }, 100);
  }, [loadingMore]);

  // Infinite scroll hook
  const { lastElementRef } = useInfiniteScroll({
    onLoadMore: loadMoreEvents,
    hasMore: hasMoreEvents,
    isLoading: loadingMore,
  });

  const getExternalAgencies = async (): Promise<void> => {
    if (zipCode) {
      try {
        const params: Record<string, string> = { zip_code: zipCode };
        if (distance && distance !== 'All distances') {
          params.distance = String(distance);
        }
        const resp = await axios.get(API_URL.EXTERNAL_AGENCIES, {
          params,
          timeout: REQUEST_TIMEOUT_MS,
        });
        setExternalAgencies(resp.data.external_agencies || []);
      } catch (err) {
        // External agencies are supplementary — a failure here must not block or
        // error the primary event results, so it degrades to an empty list.
        setExternalAgencies([]);
      }
    }
  };

  const getEvents = async (): Promise<void> => {
    if (zipCode) {
      setLoading(true);
      setEventsError(false);
      setExternalAgencies([]);
      try {
        // When "All distances" is selected, omit distance so backend uses findByZip (no radius filter).
        const params: Record<string, string> = {
          zip_code: zipCode,
          ...(serviceCat && { category: serviceCat }),
        };
        if (distance && distance !== 'All distances') {
          params.distance = String(distance);
        }
        const resp = await axios.get(API_URL.EVENTS_LIST, {
          params,
          timeout: REQUEST_TIMEOUT_MS,
        });
        const {
          data: { agencies },
        } = resp;

        setAgencyData(agencies);
        if (zip !== zipCode || filteredData.length === 0) {
          setZip(zipCode);
          setFilteredData(agencies);
        }
        setLoading(false);
        getExternalAgencies();
      } catch (err) {
        // Distinguish failure from "search returned nothing": without this the
        // page renders the no-events message, which tells the user there is no
        // food available when in fact the request never succeeded.
        setEventsError(true);
        setAgencyData([]);
        setFilteredData([]);
        setLoading(false);
        getExternalAgencies();
      }
    }
  };

  useEffect(() => {
    if (zipCode) {
      // Reset progressive rendering when search params change
      setVisibleEventCount(EVENTS_PER_BATCH);
      getEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipCode, distance, serviceCat, availability, reservations]);

  // Reset visible count when filters change (so we show filtered results from the start)
  useEffect(() => {
    setVisibleEventCount(EVENTS_PER_BATCH);
    setHasMoreEvents(true); // Reset to true when filters change, will be updated by EventListContainer
  }, [availability, reservations]);

  useEffect(() => {
    if (zipCode) {
      dispatch(setCurrentZip(zipCode));
      getFoodbanks(zipCode);
    }
  }, [zipCode, dispatch]);

  const ResourceList: React.FC = () => {
    if (foodBankResponse) {
      return <ResourceListComponent dataToChild={foodBankData} />;
    }
    if (serverError) {
      return <h2>Something went wrong</h2>;
    }
    return null;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>();

  const getFoodbanks = async (zip: string): Promise<void> => {
    if (zip) {
      setLoading(true);
      const foodBankUri = API_URL.FOODBANK_LIST;

      try {
        const resp = await axios.get(foodBankUri, {
          params: { zip_code: zip },
          timeout: REQUEST_TIMEOUT_MS,
        });
        const { data } = resp;
        setFoodBankData(data);
        setFoodBankResponse(true);
        setLoading(false);
      } catch (err) {
        setServerError(true);
        setLoading(false);
      }
    }
  };

  const onSubmit = ({
    zip_code,
    distance,
    serviceCat,
    availability,
    reservations,
  }: SearchFormData): void => {
    let url = `/events/list/`;
    if (zip_code) {
      url += zip_code + '/';
    }
    if (distance) {
      url += distance + '/';
    }
    // Only add serviceCat if it's not "All" or empty
    if (serviceCat && serviceCat !== 'All') {
      url += serviceCat + '/';
    }

    // Use query parameters for availability and reservations to avoid URL structure issues
    const queryParams = new URLSearchParams();
    // Always include availability in URL so we can distinguish between
    // default (next_7_days) and user explicitly selecting "All"
    if (availability) {
      queryParams.set('availability', availability);
    }
    if (reservations) {
      queryParams.set('reservations', 'true');
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    navigate(url);
  };

  localStorage.setItem('search_zip', `${zipCode}`);

  return (
    <div data-testid="event-list-page">
      <section className="bg-[#F2F0F4]">
        <div className="container mx-auto px-4 pt-24 pb-24">
          <div className="min-h-[130px] bg-white rounded-lg shadow-md -mt-56 mb-12 mx-auto p-8 text-left sm:w-full sm:min-w-auto sm:p-6 sm:-mt-36 md:w-11/12 md:min-w-auto lg:min-w-[600px] lg:w-auto lg:max-w-[900px]">
            <form onSubmit={handleSubmit(onSubmit)}>
              <SearchComponent
                register={register}
                errors={errors}
                onSubmitHandler={onSubmit}
                z_code={zipCode}
                range={distance?.toString() || ''}
                categories={categories}
                isLoading={loading}
                initialAvailability={availability}
                initialReservations={reservations}
              />
            </form>
            {loading && (
              <div className="pt-4">
                <LoadingSpinner size="medium" />
              </div>
            )}
            {!loading && <ResourceList />}
          </div>
          {!loading && eventsError && (
            <div
              className="bg-white rounded-lg shadow-md mx-auto p-8 text-center"
              role="alert"
              data-testid="events-error"
            >
              <h3 className="text-xl font-semibold text-gray-700">
                {localization.events_load_error}
              </h3>
              <button
                type="button"
                className="btn-primary mt-4 min-h-[44px] px-6 py-2 rounded-md font-semibold"
                onClick={() => getEvents()}
                data-testid="events-error-retry"
              >
                {localization.events_load_error_retry}
              </button>
            </div>
          )}
          {!loading && !eventsError && (
            <EventListContainer
              agencyData={agencyData}
              visibleEventCount={visibleEventCount}
              zipCode={zipCode}
              availabilityFilter={availability}
              reservationsFilter={reservations}
              distance={Number(distance) || 10}
              lastItemRef={lastElementRef}
              loadingMore={loadingMore}
              onHasMoreChange={setHasMoreEvents}
              externalAgencies={externalAgencies}
            />
          )}
          {loading && <LoadingSpinner />}
        </div>
      </section>
    </div>
  );
};

export default EventContainer;
