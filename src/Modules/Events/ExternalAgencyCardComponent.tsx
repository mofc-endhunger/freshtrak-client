import React, { useState } from 'react';
import { ExternalAgency, ExternalAgencyHour } from './types/externalAgency.types';
import localization from '../Localization/LocalizationComponent';
import '../../Assets/scss/main.scss';

type CardVariant = 'tile' | 'list';

interface ExternalAgencyCardComponentProps {
  agency: ExternalAgency;
  variant?: CardVariant;
  isHighlighted?: boolean;
}

const DAY_ABBREV_TO_FULL: Record<string, string> = {
  MO: 'Monday',
  TU: 'Tuesday',
  WE: 'Wednesday',
  TH: 'Thursday',
  FR: 'Friday',
  SA: 'Saturday',
  SU: 'Sunday',
};

const DAY_ORDER = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

// Format "13:00:00" -> "1:00 PM"
const formatTime = (time: string): string => {
  const parts = time.split(':');
  if (parts.length < 2) return time;
  let hour = parseInt(parts[0], 10);
  const min = parts[1];
  if (isNaN(hour)) return time;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${min} ${ampm}`;
};

const ORDINAL_SUFFIX: Record<number, string> = {
  1: '1st',
  2: '2nd',
  3: '3rd',
  4: '4th',
  5: '5th',
};

// Parse a day code like "FR", "1SA", "2FR" into { ordinal?, day }
const parseDayCode = (code: string): { ordinal: number | null; day: string } => {
  const trimmed = code.trim().toUpperCase();
  const match = trimmed.match(/^(\d+)([A-Z]{2})$/);
  if (match) {
    return { ordinal: parseInt(match[1], 10), day: match[2] };
  }
  return { ordinal: null, day: trimmed };
};

// Format a parsed day into human-readable string
const formatDayName = (ordinal: number | null, day: string): string => {
  const dayName = DAY_ABBREV_TO_FULL[day] || day;
  if (ordinal != null) {
    const suffix = ORDINAL_SUFFIX[ordinal] || `${ordinal}th`;
    return `${suffix} ${dayName}`;
  }
  return dayName;
};

// Group hours by time range and collect days, then format human-readably
const formatHours = (hours: ExternalAgencyHour[]): string[] => {
  if (!hours || hours.length === 0) return [];

  const sortedHours = [...hours].sort((a, b) => a.sort_order - b.sort_order);

  // Separate entries into ordinal (e.g. "1SA") and plain (e.g. "FR") groups
  // They use different formatting: ordinal days list individually, plain days can collapse into ranges
  const timeRangeToPlainDays: Record<string, Set<string>> = {};
  const timeRangeToOrdinalDays: Record<string, { ordinal: number; day: string }[]> = {};

  for (const h of sortedHours) {
    if (!h.byday || !h.start_time || !h.end_time) continue;
    const timeRange = `${formatTime(h.start_time)} - ${formatTime(h.end_time)}`;
    const codes = h.byday.split(',').map((d) => d.trim());

    for (const code of codes) {
      const parsed = parseDayCode(code);
      if (parsed.ordinal != null) {
        if (!timeRangeToOrdinalDays[timeRange]) timeRangeToOrdinalDays[timeRange] = [];
        // Avoid duplicates
        const exists = timeRangeToOrdinalDays[timeRange].some(
          (e) => e.ordinal === parsed.ordinal && e.day === parsed.day,
        );
        if (!exists)
          timeRangeToOrdinalDays[timeRange].push({ ordinal: parsed.ordinal, day: parsed.day });
      } else {
        if (!timeRangeToPlainDays[timeRange]) timeRangeToPlainDays[timeRange] = new Set();
        timeRangeToPlainDays[timeRange].add(parsed.day);
      }
    }
  }

  const result: string[] = [];

  // Format plain days (collapse consecutive into ranges like "Monday - Friday")
  for (const [timeRange, daySet] of Object.entries(timeRangeToPlainDays)) {
    const sortedDays = [...daySet].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
    const dayNames = sortedDays.map((d) => DAY_ABBREV_TO_FULL[d] || d);

    const ranges: string[] = [];
    let rangeStart = 0;
    for (let i = 1; i <= sortedDays.length; i++) {
      const prevIdx = DAY_ORDER.indexOf(sortedDays[i - 1]);
      const currIdx = i < sortedDays.length ? DAY_ORDER.indexOf(sortedDays[i]) : -1;
      if (currIdx === prevIdx + 1) continue;
      if (i - 1 === rangeStart) {
        ranges.push(dayNames[rangeStart]);
      } else {
        ranges.push(`${dayNames[rangeStart]} - ${dayNames[i - 1]}`);
      }
      rangeStart = i;
    }

    result.push(`${ranges.join(', ')}: ${timeRange}`);
  }

  // Format ordinal days (e.g. "1st Saturday, 3rd Saturday: 12:00 PM - 4:00 PM")
  for (const [timeRange, entries] of Object.entries(timeRangeToOrdinalDays)) {
    // Sort by day order first, then by ordinal
    const sorted = [...entries].sort((a, b) => {
      const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
      return dayDiff !== 0 ? dayDiff : a.ordinal - b.ordinal;
    });
    const names = sorted.map((e) => formatDayName(e.ordinal, e.day));
    result.push(`${names.join(', ')}: ${timeRange}`);
  }

  return result;
};

const ExternalAgencyCardComponent: React.FC<ExternalAgencyCardComponentProps> = ({
  agency,
  variant = 'tile',
  isHighlighted = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const {
    name,
    address,
    city,
    state,
    zip,
    phone,
    hours,
    description,
    website,
    directory_url,
    org_name,
    service_category,
    estimated_distance,
  } = agency;

  const fullAddress = [address, city, state, zip].filter(Boolean).join(', ');

  const handleGetDirections = () => {
    const encodedAddress = encodeURIComponent(fullAddress);
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(directionsUrl, '_blank');
  };

  const formattedHours = formatHours(hours);
  const hasDetails = description || formattedHours.length > 0 || website || directory_url;

  // List variant
  if (variant === 'list') {
    return (
      <section tabIndex={0} className="w-full py-1" data-testid="external-agency-card">
        <div className="flex flex-row items-stretch">
          {/* Gray dot placeholder for alignment */}
          <div className="flex items-center justify-center w-10 sm:w-12 shrink-0">
            <div className="w-3 h-3 bg-gray-500 rounded-full border-2 border-white shadow-md" />
          </div>

          <div
            className={`flex-1 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
              isHighlighted ? 'ring-2 ring-gray-400' : ''
            }`}
          >
            <div className="flex flex-row">
              {/* Orange accent bar */}
              <div className="bg-gray-500 w-[6px] shrink-0" />

              {/* Main Content */}
              <div className="flex-1 p-2 sm:p-3 lg:p-4 flex flex-col sm:flex-row gap-2 overflow-hidden min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate text-xs sm:text-sm">{name}</div>
                  {org_name && org_name !== name && (
                    <div className="text-[10px] sm:text-xs text-gray-500 font-varela truncate">
                      {org_name}
                    </div>
                  )}
                  {service_category && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] sm:text-xs rounded-full font-medium">
                      {service_category}
                    </span>
                  )}
                  {(address || estimated_distance) && (
                    <div className="flex items-baseline justify-between mt-1 gap-2">
                      {address && (
                        <div className="text-[10px] sm:text-xs font-varela text-gray-600 truncate">
                          {fullAddress}
                        </div>
                      )}
                      {estimated_distance != null && estimated_distance > 0 && (
                        <div className="text-[10px] sm:text-xs font-varela text-gray-500 whitespace-nowrap shrink-0">
                          {estimated_distance.toFixed(1)} mi
                        </div>
                      )}
                    </div>
                  )}
                  {phone && (
                    <div className="text-[10px] sm:text-xs font-varela text-gray-600 mt-0.5">
                      {phone}
                    </div>
                  )}

                  {showDetails && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg space-y-2">
                      {description && (
                        <p className="text-[10px] sm:text-xs text-gray-700">{description}</p>
                      )}
                      {formattedHours.length > 0 && (
                        <div>
                          <div className="text-[10px] sm:text-xs font-bold text-gray-700 mb-1">
                            {localization.external_agency_hours || 'Hours'}
                          </div>
                          {formattedHours.map((line, i) => (
                            <div key={i} className="text-[10px] sm:text-xs text-gray-600">
                              {line}
                            </div>
                          ))}
                        </div>
                      )}
                      {website && (
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] sm:text-xs text-blue-600 hover:underline block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {localization.visit_website || 'Visit Website'}
                        </a>
                      )}
                      {directory_url && (
                        <a
                          href={directory_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] sm:text-xs text-blue-600 hover:underline block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {localization.view_listing || 'View Listing'}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="hidden sm:flex flex-col gap-1.5 w-[120px] lg:w-[140px] xl:w-[160px] shrink-0">
                  {hasDetails && (
                    <button
                      className="btn bg-gray-200 text-[#392947] py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-bold uppercase min-h-[32px] lg:min-h-[36px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetails(!showDetails);
                      }}
                    >
                      {!showDetails
                        ? localization.button_view_details
                        : localization.button_hide_details}
                    </button>
                  )}
                  <button
                    className="btn bg-gray-200 text-[#392947] py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-bold uppercase min-h-[32px] lg:min-h-[36px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetDirections();
                    }}
                  >
                    {localization.button_get_directions}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Tile variant
  return (
    <section tabIndex={0} data-testid="external-agency-card">
      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-gray-500 text-white p-4 rounded-t-lg">
          <div className="text-lg font-bold pb-2 truncate">{name}</div>
          {org_name && org_name !== name && (
            <div className="text-sm opacity-90 truncate">{org_name}</div>
          )}
          {service_category && (
            <div className="flex justify-between text-xs">
              <div className="flex-grow truncate font-varela">{service_category}</div>
            </div>
          )}
        </div>
        <div className="p-4 min-h-[200px] flex flex-col justify-between">
          {(address || estimated_distance) && (
            <div className="flex items-start justify-between my-2 gap-2">
              {address && (
                <div className="text-xs font-varela">
                  {address}
                  <br />
                  {city} {state} {zip}
                </div>
              )}
              {estimated_distance != null && estimated_distance > 0 && (
                <div className="text-xs font-varela text-gray-500 whitespace-nowrap shrink-0">
                  {estimated_distance.toFixed(1)} mi
                </div>
              )}
            </div>
          )}
          {phone && <div className="text-xs font-varela mb-2">{phone}</div>}

          {showDetails && (
            <div className="space-y-2 mt-2">
              {description && <p className="text-xs text-gray-700">{description}</p>}
              {formattedHours.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-700 mb-1">
                    {localization.external_agency_hours || 'Hours'}
                  </div>
                  {formattedHours.map((line, i) => (
                    <div key={i} className="text-xs text-gray-600">
                      {line}
                    </div>
                  ))}
                </div>
              )}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline block"
                >
                  {localization.visit_website || 'Visit Website'}
                </a>
              )}
              {directory_url && (
                <a
                  href={directory_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline block"
                >
                  {localization.view_listing || 'View Listing'}
                </a>
              )}
            </div>
          )}

          <div className="space-y-3 mt-3">
            <div className="flex flex-col gap-2">
              {hasDetails && (
                <button
                  className="btn bg-gray-200 text-[#392947] px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px]"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {!showDetails
                    ? localization.button_view_details
                    : localization.button_hide_details}
                </button>
              )}
              <button
                className="btn bg-gray-200 text-[#392947] px-9 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex-grow min-h-[50px]"
                onClick={handleGetDirections}
              >
                {localization.button_get_directions}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExternalAgencyCardComponent;
