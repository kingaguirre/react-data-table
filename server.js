import jsonServer from 'json-server';
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

server.use(jsonServer.bodyParser);

function deepSearch(obj, searchString) {
  if (typeof obj === 'string' || typeof obj === 'number') {
    return String(obj).toLowerCase().includes(searchString.toLowerCase());
  }

  if (Array.isArray(obj)) {
    return obj.some(item => deepSearch(item, searchString));
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj).some(value => deepSearch(value, searchString));
  }

  return false;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && acc[part]) ? acc[part] : null, obj);
}

function isValidDate(dateString) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if(!dateString.match(regEx)) return false;  // Invalid format
  const d = new Date(dateString);
  const dNum = d.getTime();
  if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0,10) === dateString;
}

server.post('/custom-items', (req, res) => {
  const { pageNumber, pageSize, searchString, sortColumn, sortDirection, filter } = req.body;

  if (!pageNumber || !pageSize) {
    console.error('Both pageNumber and pageSize parameters are required');
    res.status(400).send({ error: 'Both pageNumber and pageSize parameters are required' });
    return;
  }

  const start = (Number(pageNumber) - 1) * Number(pageSize);
  const end = Number(pageNumber) * Number(pageSize);

  let items = router.db.get('items').value();

  if (searchString) {
    items = items.filter(item => deepSearch(item, searchString));
  }

  if (filter && typeof filter === 'object') {
    items = items.filter(item => {
      return Object.entries(filter).every(([key, value]) => {
        if (!value) return true; // If filter value is empty, don't apply the filter
    
        // Check if any item has this key
        if (!item.hasOwnProperty(key.split('.')[0])) return true; // If the item doesn't have the key, ignore the filter
    
        const itemValue = getNestedValue(item, key);
        if (itemValue === null || itemValue === undefined) return false; // If the item doesn't have the key, filter it out
    
        // Handle range-based filtering
        if (typeof value === 'object' && (value.min !== undefined || value.max !== undefined)) {
          const numericItemValue = parseFloat(itemValue);
          const numericMin = parseFloat(value.min);
          const numericMax = parseFloat(value.max);
    
          // If min and max is not defined
          if (!numericMax && numericMin) return true;

          // If max is less than min, don't apply the filter for this key
          if (numericMax < numericMin) return true;
    
          if (value.min !== undefined && numericItemValue < numericMin) {
            return false; // Item value is below specified minimum
          }
    
          if (value.max !== undefined && numericItemValue > numericMax) {
            return false; // Item value is above specified maximum
          }

          // Handle date-range filtering
          if (isValidDate(value.min) && isValidDate(value.max)) {
            const dateItemValue = new Date(itemValue);
            const dateMin = new Date(value.min);
            const dateMax = new Date(value.max);

            if (isNaN(dateItemValue.getTime())) return false; // If the item's date value is not valid, filter it out
            
            if (dateItemValue < dateMin || dateItemValue > dateMax) {
              return false; // Item date is outside of specified range
            }

            return true; // Item date is within specified range
          }
    
          return true; // Item value is within specified range
        }
    
        if (Array.isArray(itemValue) && /\[\d+\]/.test(key)) {
          // If the key indicates a specific array index, like userAccounts[0], 
          // then we only want to match against that specific index
          const arrayIndex = Number(key.match(/(\d+)/)[1]);
          return String(itemValue[arrayIndex] || '').toLowerCase().includes(String(value).toLowerCase());
        }
    
        return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
      });
    });
  }

  if (sortColumn !== 'none' && sortDirection !== 'none') {
    items = items.sort((a, b) => {
      const aValue = String(getNestedValue(a, sortColumn) || ''); // handle undefined values
      const bValue = String(getNestedValue(b, sortColumn) || '');

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }

  const data = items.slice(start, end);
  const totalItems = items.length;

  // Simulate a slow API response with a timeout
  // setTimeout(() => {
  res.json({ data: { dataTableItem: data, count: totalItems } });
  // }, 1000); // 2-second delay
});

server.use(router);
server.listen(3001, () => {
  console.log('JSON Server is running');
});
