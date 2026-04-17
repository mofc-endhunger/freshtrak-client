const isArray = (data) => {
  return data && Array.isArray(data) && data.length > 0;
};

const serviceCatFilter = (agencyData) => {
  let categories = [];
  if (isArray(agencyData)) {
    agencyData.forEach((item) => {
      let { events } = item;
      if (isArray(events)) {
        events.forEach((obj) => {
          let { service_category } = obj;
          if (service_category && service_category.id) {
            let duplicates = categories.filter((i) => i.id === service_category.id);
            if (duplicates.length === 0) {
              categories.push(service_category);
            }
          }
        });
      }
    });
  }

  return categories;
};

export default serviceCatFilter;
