# Expense Analyser App

The Expense Analyser App is designed to help users track and manage their expenses efficiently. It supports individual users and groups, providing detailed insights into spending habits and budget adherence.

## Table of Contents

- [Models](#models)
  - [User](#user)
  - [Group](#group)
  - [Group Members](#group-members)
  - [Category](#category)
  - [Expense](#expense)
  - [Report](#report)
  - [Notification](#notification)
  - [Budget](#budget)
- [ER Diagram](#er-diagram)
- [Endpoints](#endpoints)
  - [User Endpoints](#user-endpoints)
  - [Group Endpoints](#group-endpoints)
  - [Category Endpoints](#category-endpoints)
  - [Expense Endpoints](#expense-endpoints)
  - [Report Endpoints](#report-endpoints)
  - [Notification Endpoints](#notification-endpoints)
  - [Budget Endpoints](#budget-endpoints)

## Models

### User

![user icon](https://img.icons8.com/?size=100&id=RH2knxpdDpjm&format=png&color=000000)

- **id** (string, pk)
- **name** (string)
- **profilePhoto** (string)
- **phone** (string)
- **email** (string)
- **password** (string)
- **refreshToken** (string)
- **dateJoined** (string)
- **color**: blue

### Group

![group icon](https://img.icons8.com/?size=100&id=60tMLyTAWm4h&format=png&color=000000)

- **id** (string, pk)
- **name** (string)
- **createdBy** (string, pk)
- **avatar** (string)
- **color**: green

### Group Members

![group members icon](https://img.icons8.com/?size=100&id=Ut1mhCuyFDJQ&format=png&color=000000)

- **id** (string, pk)
- **groupId** (string, pk)
- **userId** (string, pk)
- **role** (string)
- **color**: white

### Category

![category icon](https://img.icons8.com/?size=100&id=CKtPhNMyI8bF&format=png&color=000000)

- **id** (string, pk)
- **userId** (string, pk)
- **name** (string)
- **categoryBudget** (Number)
- **color**: orange

### Expense

![expense icon](https://img.icons8.com/?size=100&id=h3USDbkfsNWM&format=png&color=000000)

- **id** (string, pk)
- **categoryId** (string, pk)
- **groupId** (string, pk or null)
- **userId** (string, pk)
- **name** (string)
- **description** (string)
- **amount** (Number)
- **month** (Number)
- **year** (Number)
- **color**: red

### Report

![report icon](https://img.icons8.com/?size=100&id=dcpSluQunF5R&format=png&color=000000)

- **id** (string, pk)
- **categoryId** (string, pk)
- **userId** (string, pk)
- **groupId** (string, pk)
- **month** (Number)
- **year** (Number)
- **totalAmountSpent** (Number)
- **color**: pink

### Notification

![notification icon](https://img.icons8.com/?size=100&id=q83D9p2dPS2W&format=png&color=000000)

- **id** (string, pk)
- **userId** (string, pk)
- **expenseId** (string, pk)
- **groupId** (string, pk)
- **name** (string)
- **type** (string)
- **createdAt** (string)
- **isRead** (boolean)
- **color**: yellow

### Budget

![budget icon](https://img.icons8.com/color/48/000000/money.png)

- **id** (string, pk)
- **userId** (string, pk or null)
- **groupId** (string, pk or null)
- **amount** (integer)
- **month** (integer)
- **year** (string)
- **color**: skyblue

## ER Diagram

![ER Diagram](public/temp/ER%20diagram/diagram-export-29-05-2024-00_38_54.png)

## Endpoints

### User Endpoints

- **POST /api/v1/users/register**: Register a new user.
- **POST /api/v1/users/login**: Login a user.
- **GET /api/v1/users/logout**: Logging user out.
- **PATCH /api/v1/users/edit-profile**: Edit user profile.
- **POST /api/v1/users/change-password**: Change user password.

### Group Endpoints

- **POST /api/v1/groups/create-group**: Create a new group.
- **POST /api/v1/groups/delete-member/:groupMemberId**: delete member from a group.
- **POST /api/v1/groups/delete-group/:groupId**: delete group.
- **PATCH /api/v1/groups/edit-profile/profile-picture/:groupId**: Edit profile picture of group.
- **PATCH /api/v1/groups/edit-profile/group-info/:groupId**: Edit group info.
- **GET /api/v1/groups/all**: get all groups of a particular user.
- **POST /api/v1/groups/details/:groupId**: get group details of a particular group.

### Category Endpoints

- **POST /api/v1/categories/create**: Create a new category.

### Expense Endpoints

- **POST /api/v1/expenses/add-expense**: Add a new expense.
- **POST /api/v1/expenses/get-expenses**: Get All expense of a user.
- **GET /api/v1/expenses/get-category-expenses**: Get category wise expense info of a user.

### Budget Endpoints

- **POST /api/v1/budgets/create-budget**: Create a new budget.
- **GET /api/v1/budgets/get-budgets**: Get budgets for a user or group.
- **GET /api/v1/budgets/current-budget**: Get current budgets for a user or group.

## Getting Started

To get started with the Expense Analyser App, clone the repository and follow the instructions in the `README.md` file for setup and installation.

```sh
git clone https://github.com/yourusername/expense-analyser-app.git
cd expense-analyser-app
npm install
npm start
```

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please open an issue or contact the project maintainers.
