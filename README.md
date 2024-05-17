# User Management Web Application

## Overview

This is a simple web application designed for managing user accounts. It allows administrators to add, delete, and filter users, ensuring an easy way to maintain an up-to-date user list. The application also features pagination for user lists, session timeout management, and filtering functionalities.

## Features

1. **User Addition**: Add new users with a unique username and password.
2. **User Deletion**: Select multiple users and delete them after confirmation.
3. **Pagination**: Navigate through the user list with a fixed number of users per page.
4. **Filtering**: Filter the user list based on the input text.
5. **Session Management**: Automatic session timeout after 30 minutes of inactivity.
6. **Responsive Design**: User interface designed to be user-friendly and responsive.

## How to Use

1. **Add a User**:
    - Enter the username and password in the respective fields.
    - Click on "Add User".
    - If the username already exists, an alert will notify you.
    - If the user is successfully added, the input fields will be cleared.

2. **Delete Users**:
    - Select the users you want to delete using the checkboxes.
    - Click on the "Delete Selected Users" button.
    - Confirm the deletion in the prompt that appears.

3. **Filter Users**:
    - Enter the text in the search input field above the user table.
    - The table will display only the users whose usernames contain the input text.
    - Pagination will adjust based on the filtered results.

4. **Session Timeout**:
    - The session will automatically end after 30 minutes of inactivity, logging out the user.


## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for review.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or suggestions, please contact [your email].
