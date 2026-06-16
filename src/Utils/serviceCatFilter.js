const isArray = (data) => {
  return data && Array.isArray(data) && data.length > 0;
};

const serviceCatFilter = (agencyData) => {
  const categories = [];
  if (isArray(agencyData)) {
    agencyData.forEach((item) => {
      const { events } = item;
      if (isArray(events)) {
        events.forEach((obj) => {
          const { service_category } = obj;
          if (service_category && service_category.id) {
            const duplicates = categories.filter((i) => i.id === service_category.id);
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
