# Email Monitoring System

The Email Monitoring System is an intelligent solution designed to alleviate email overload and ensure timely attention to critical communications. It offers a range of features to help users manage their emails more effectively.

## Demo

Check out the live demo of Email Monitoring System [here](https://email-monitoring-system-silk.vercel.app/).

## Scope of the Project

The proposed project aims to develop an intelligent email monitoring system with the following key features:

### Email Integration

The system seamlessly integrates with popular email service providers, allowing users to connect their email accounts securely.

### Priority Identification

Advanced algorithms analyze incoming emails to identify important messages based on user-defined criteria such as keywords, sender reputation, or specific email threads.

### Notification Mechanism

Important emails trigger notifications through multiple channels, including email alerts and SMS messages to the user's registered mobile number. Notifications persist until the user acknowledges or responds to the email.

### Customization Options

Users can customize notification preferences and fine-tune criteria for identifying important emails, including setting filters, defining priority levels, and configuring notification schedules.

### User Interface

The system features an intuitive and user-friendly interface accessible via web or mobile applications. It provides clear visibility into the user's email inbox, highlighting important emails and facilitating quick action.

### Security and Privacy

Robust security measures, including encryption of sensitive information, adherence to industry-standard security protocols, and compliance with data protection regulations, safeguard user data and maintain confidentiality.

### Performance Optimization

The system is optimized for efficiency and reliability, ensuring minimal latency in email processing and notification delivery. It includes features to mitigate the impact of slow internet connections or network disruptions.

### Feedback Mechanism

Users can provide feedback on the accuracy and effectiveness of the email prioritization and notification system, which will be used to continuously refine and improve performance.

## Installation and Usage

### Prerequisites

Before running the Email Monitoring System, ensure you have the following prerequisites installed:

- Node.js LTS version
- Git

### Steps

To clone and use the Email Monitoring System, follow these steps:

1. Clone this repository to your local machine:

```git
git clone https://github.com/Vinoth82003/email-monitoring-system.git
```

2. Navigate to the project directory:

```bash
cd email-monitoring-system
```

3. Install dependencies:

```node
npm install dotenv express node-imap @vonage/server-sdk mongoose https
```

4. Set up environment variables:

Create a `.env` file in the root directory and add the necessary environment variables:

```
EMAIL=your_email@example.com
PASS=your_email_password
VONAGE_API=api_key_from_Vonage
VONAGE_SECRET=secret_key_from_Vonage
MONGO_URL=connection_string/importantMails
```

Replace `your_email@example.com` with your email address and `your_email_password` with your email app password. Obtain the Vonage API key and secret from your Vonage account and replace `api_key_from_Vonage` and `secret_key_from_Vonage` respectively. Replace `connection_string/importantMails` with the connection string to your MongoDB database where important emails will be stored.

5. Start the server:

```node
node app
```

The system will be accessible at the specified port.

## Technology Stacks

The Email Monitoring System is built using the following technologies:

- HTML
- CSS
- JavaScript
- Node.js
- Node-IMAP
- MongoDB

## Requirements

The project requires the following dependencies:

```json
{
  "dependencies": {
    "@vonage/server-sdk": "^3.14.0",
    "axios": "^1.6.8",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "https": "^1.0.0",
    "mongoose": "^8.3.2",
    "multer": "^1.4.5-lts.1",
    "node-imap": "^0.9.6",
    "nodemailer": "^6.9.13"
  }
}
```

Ensure these dependencies are installed before running the system.

## Contact

For any questions or inquiries, feel free to contact Vinoth at vinothg0618@gmail.com.

## License

The Email Monitoring System is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
