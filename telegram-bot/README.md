# Zenny Telegram Bot

This is the Telegram bot component of the Zenny platform, which facilitates anonymous collaboration between creators and editors.

## Features

- **Anonymous Chat System**: Creators and editors can communicate without revealing personal information
- **Role-based Access**: Different permissions for creators, editors, and admins
- **Admin Controls**: Admins can monitor, freeze, and end chat sessions
- **File Sharing**: Secure sharing of sample edits and final videos via Google Drive
- **Payment Integration**: Payment links and final video delivery workflow
- **Privacy Protection**: Automatic detection and prevention of personal information sharing

## Setup

### 1. Environment Variables

Create a `.env` file in the `telegram-bot` directory:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url
```

### 2. Install Dependencies

```bash
cd telegram-bot
npm install
```

### 3. Add Test Editors

Run the script to add test editors to the database:

```bash
npm run add-test-editors
```

This will create 3 test editors with the following credentials:

- Editor 1: `editor123`
- Editor 2: `editor456`
- Editor 3: `editor789`

### 4. Update Admin IDs

Edit `shared-utils/constants.js` and update the `ADMIN_IDS` array with actual admin Telegram IDs.

### 5. Start the Bot

```bash
npm run dev
```

## Usage

### For Creators

1. **Register**: Send `/register` to register as a creator
2. **Start Chat**: Use `/chat <editor_id>` to start a chat with an editor
3. **Communicate**: Send messages in the group chat (personal info is automatically filtered)

### For Editors

1. **Login**: Use `/login <password>` to login with your assigned password
2. **Receive Chats**: You'll be added to chat groups when creators start sessions
3. **Share Sample**: Use `/sample <drive_link>` to share sample edits
4. **Send Payment**: Use `/payment <payment_link>` to send payment links
5. **Deliver Final**: Use `/final <video_link>` to deliver the final video

### For Admins

1. **Monitor**: All chat messages are logged for monitoring
2. **Freeze Chat**: Use `/freeze` to freeze a chat session
3. **End Chat**: Use `/end` to end a chat session

## Commands

| Command             | Description            | Who Can Use  |
| ------------------- | ---------------------- | ------------ |
| `/start`            | Start the bot          | Everyone     |
| `/help`             | Show help message      | Everyone     |
| `/register`         | Register as creator    | New users    |
| `/login <password>` | Login as editor        | Editors      |
| `/chat <editor_id>` | Start chat with editor | Creators     |
| `/freeze`           | Freeze current chat    | Admins only  |
| `/end`              | End current chat       | Admins only  |
| `/sample <link>`    | Upload sample edit     | Editors only |
| `/payment <link>`   | Send payment link      | Editors only |
| `/final <link>`     | Send final video       | Editors only |

## Workflow

1. **Creator Registration**: Creator registers using `/register`
2. **Editor Login**: Editor logs in using `/login <password>`
3. **Chat Initiation**: Creator starts chat with editor using `/chat <editor_id>`
4. **Anonymous Communication**: Both parties communicate anonymously in group chat
5. **Sample Sharing**: Editor shares sample edit using `/sample <drive_link>`
6. **Payment**: Editor sends payment link using `/payment <payment_link>`
7. **Final Delivery**: Editor delivers final video using `/final <video_link>`
8. **Admin Monitoring**: Admin can monitor and control the entire process

## Security Features

- **Personal Info Detection**: Automatically detects and prevents sharing of phone numbers, emails, etc.
- **Message Sanitization**: Removes sensitive information from messages
- **Role-based Permissions**: Different commands available based on user role
- **Session Management**: Proper session tracking and state management
- **Admin Controls**: Admins can freeze or end sessions for policy violations

## Database Schema

The bot uses MongoDB with the following collections:

- **Creators**: Store creator information and registration data
- **Editors**: Store editor information and login credentials
- **Sessions**: Track chat sessions, status, and workflow progress

## Development

To run in development mode with auto-restart:

```bash
npm run dev
```

The bot will automatically restart when you make changes to the code.
