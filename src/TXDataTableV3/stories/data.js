const users = [];

for (let i = 1; i <= 50; i++) {
  users.push({
    id: i,
    name: `User ${i}`,
    username: `user${i}`,
    email: `user${i}@example.com`,
    isSelected: `${i <= 5}`,
    address: {
      street: `Street ${i}`,
      suite: `Suite ${i}`,
      city: `City ${i}`,
      zipcode: `0000${i}`,
      geo: {
        lat: `${i}`,
        lng: `${i}`
      }
    },
    phone: `000-000-000${i}`,
    website: `website${i}.com`,
    company: {
      name: `Company ${i}`,
      catchPhrase: `CatchPhrase ${i}`,
      bs: `BS ${i}`
    }
  });
}

module.exports = users;