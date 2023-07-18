export const DATA_SOURCE = Array(20).fill("").map((_, i) => ({
  userID: `user-id${i}`,
  username: `test-username${i}`,
  password: `test-password${i}`,
  userDetails: {
    email: `test${i}@email.com`,
    isAdmin: i % 2 === 0,
    other: `other value${i}`,
    birthDay: `24-08-199${i}`,
    firstName: `John${i}`,
    lastName: `Doe${i}`,
    phoneNumber: `123-456-78${i}0`,
    address: `${i}23 Main St`,
    city: 'New York',
    state: 'NY',
    zipCode: `1000${i}`,
  },
  userAccounts: [
    { account1: `test account1-${i}` },
    { account2: `test account2-${i}` },
    { account3: { accountNumber: `test account number 3-${i}` } },
  ],
}));

export const COLUMN_SETTINGS = [
  {
    column: 'username',
    title: 'Username',
    align: 'center',
    freeze: true,
    filterBy: {
      type: 'text',
      value: '',
    },
  },
  {
    column: 'password',
    title: 'Password',
    width: '200px',
  },
  {
    column: 'userDetails.email',
    title: 'Email',
    groupTitle: 'User Details',
    order: 1,
    freeze: true
  },
  {
    column: 'userDetails.isAdmin',
    title: 'Is Admin',
    groupTitle: 'User Details',
    order: 0,
    filterBy: {
      type: 'select',
      value: '',
      options: [{
        text: 'admin',
        value: 'true'
        },{
        text: 'clerk',
        value: 'false'
        }]
    },
  },
  {
    column: 'userDetails.other',
    title: 'Other',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.birthDay',
    title: 'Birth Day',
    groupTitle: 'User Details',
    order: 5
  },
  {
    column: 'userDetails.firstName',
    title: 'First Name',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.lastName',
    title: 'Last Name',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.phoneNumber',
    title: 'Phone Number',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.address',
    title: 'Address',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.city',
    title: 'City',
  },
  {
    column: 'userDetails.state',
    title: 'State',
  },
  {
    column: 'userDetails.zipCode',
    title: 'Zip Code',
  },
  {
    column: 'userAccounts[0].account1',
    title: 'Account 1',
    groupTitle: 'User Accounts',
  },
  {
    column: 'userAccounts[1].account2',
    title: 'Account 2',
    groupTitle: 'User Accounts',
    hide: true
  },
  {
    column: 'userAccounts[2].account3',
    title: 'Account 3',
    groupTitle: 'User Accounts',
    hide: true
  },
];