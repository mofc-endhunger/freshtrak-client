interface ServiceCategory {
  id: number;
  service_category_name: string;
}

const isArray = (data: any): data is any[] => {
  return (data && Array.isArray(data) && data.length > 0);
};

const serviceCatFilter = (agencyData: any[]): ServiceCategory[] => {
  const categories: ServiceCategory[] = [];
  if (isArray(agencyData)) {
    agencyData.forEach(item => {
      const { events } = item;
      if (isArray(events)) {
        events.forEach(obj => {
          const { service_category } = obj;
          if (service_category && service_category.id) {
            const duplicates = categories.filter(i => i.id === service_category.id);
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