import jsonServer from 'json-server';
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

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

server.get('/custom-items/:pageNumber/:pageSize/:sortColumn/:sortDirection', (req, res) => {
  const { pageNumber, pageSize, sortColumn, sortDirection } = req.params;
  const searchString = req.query.searchString || '';

  if (!pageNumber || !pageSize) {
    console.error('Both pageNumber and pageSize parameters are required');
    res.status(400).send({ error: 'Both pageNumber and pageSize parameters are required' });
    return;
  }

  const start = (Number(pageNumber) - 1) * Number(pageSize);
  const end = Number(pageNumber) * Number(pageSize);

  // Sorting data based on the sortColumn and sortDirection
  let items = router.db.get('items').value();

  if (searchString) {
    items = items.filter(item => deepSearch(item, searchString));
  }

  if (sortColumn !== 'none' && sortDirection !== 'none') {
    items = items.sort((a, b) => {
      const aValue = getNestedValue(a, sortColumn) || ''; // handle undefined values
      const bValue = getNestedValue(b, sortColumn) || '';
  
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }

  const data = items.slice(start, end);
  const totalItems = items.length;

  res.json({ data: { dataTableItem: data, count: totalItems } });
});


server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running');
});
