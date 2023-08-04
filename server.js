import jsonServer from 'json-server';
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

server.get('/custom-items/:pageNumber/:pageSize', (req, res) => {
  const { pageNumber, pageSize } = req.params;

  if (!pageNumber || !pageSize) {
    console.error('Both pageNumber and pageSize parameters are required');
    res.status(400).send({ error: 'Both pageNumber and pageSize parameters are required' });
    return;
  }

  const start = (pageNumber - 1) * pageSize;
  const end = pageNumber * pageSize;

  const data = router.db.get('items').value().slice(start, end);
  const totalItems = router.db.get('items').value().length;

  res.json({ data: {dataTableItem: data, count: totalItems} });
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running');
});
