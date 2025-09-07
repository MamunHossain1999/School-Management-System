# School Management System

A comprehensive School Management System built with React, TypeScript, Redux Toolkit, and Tailwind CSS. This system provides role-based access control for Admins, Teachers, Students, and Parents with a modern, responsive interface.

## 🚀 Features

### 🔐 Authentication & User Management
- **Role-based Login/Register** (Admin, Teacher, Student, Parent)
- **Cookie-based Authentication** with JWT tokens
- **Protected Routes** based on user roles
- **Password Reset** and profile management

### 👨‍💼 Admin Panel
- **School Information Management** (logo, name, address, contact)
- **User Management** (Students, Teachers, Staff, Parents)
- **Class & Section Management**
- **Subject Management**
- **Noticeboard & Announcements**
- **Reports & Analytics** (attendance, results, fees)
- **Academic Calendar Management**

### 👩‍🏫 Teacher Panel
- **Student Attendance Marking**
- **Assignment & Homework Management**
- **Exam Marks Entry**
- **Class Routine & Schedule**
- **Student Performance Reports**
- **Communication with Students/Parents**

### 🎓 Student Panel
- **Personal Profile Management**
- **Attendance Records**
- **Class Schedule & Routine**
- **Assignment Submission**
- **Results & Report Cards**
- **Fee Status & Payment**
- **Noticeboard Access**

### 👨‍👩‍👧‍👦 Parent Panel
- **Children's Attendance Tracking**
- **Exam Results & Performance**
- **Fee Payment Status**
- **Communication with Teachers**
- **School Events & Notifications**

### 📚 Academic Management
- **Class, Section, Subject CRUD**
- **Routine Management**
- **Syllabus Upload/Download**
- **Online Exam/Quiz System**

### 📊 Attendance & Exam System
- **Daily Attendance** (Students & Teachers)
- **Exam Scheduling**
- **Result & Grading System**
- **Report Card Generation**

### 💰 Fees & Accounting
- **Fee Structure Management**
- **Online Payment Integration** (bKash, Nagad, Stripe, PayPal)
- **Payment History**
- **Due Fee Reminders**

### 💬 Communication System
- **Noticeboard Management**
- **Message System** (Teacher ↔ Student/Parent)
- **Email/SMS Notifications**

### 🎯 Additional Features
- **Library Management** (Books, Borrow/Return)
- **Transport Management** (Bus, Driver Info, Routes)
- **Hostel Management**
- **Events & Calendar**
- **Photo Gallery**

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios
- **Authentication**: JWT with js-cookie
- **Charts**: Recharts
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd school-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔑 Demo Credentials

### Admin
- **Email**: admin@school.com
- **Password**: admin123

### Teacher
- **Email**: teacher@school.com
- **Password**: teacher123

### Student
- **Email**: student@school.com
- **Password**: student123

### Parent
- **Email**: parent@school.com
- **Password**: parent123

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   └── layout/         # Layout components (Header, Sidebar, etc.)
├── pages/
│   ├── admin/          # Admin panel pages
│   ├── teacher/        # Teacher panel pages
│   ├── student/        # Student panel pages
│   └── parent/         # Parent panel pages
├── store/
│   ├── slices/         # Redux slices
│   └── index.ts        # Store configuration
├── services/
│   └── api.ts          # API service layer
├── types/
│   └── index.ts        # TypeScript type definitions
└── App.tsx             # Main app component
```

## 🎨 UI/UX Features

- **Responsive Design** - Works on all devices
- **Modern Interface** - Clean and intuitive design
- **Role-based Navigation** - Different menus for different roles
- **Dark/Light Theme** support (coming soon)
- **Accessibility** - WCAG compliant
- **Loading States** - Smooth user experience
- **Error Handling** - User-friendly error messages

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Key Features Implemented

✅ **Authentication System** with role-based access
✅ **Redux Store** with comprehensive state management
✅ **Responsive Dashboards** for all user roles
✅ **Modern UI Components** with Tailwind CSS
✅ **Protected Routing** system
✅ **Mock API** for development and testing
✅ **Form Validation** with React Hook Form
✅ **Toast Notifications** for user feedback

## 🚧 Upcoming Features

- Real backend API integration
- Advanced reporting and analytics
- Mobile app version
- Multi-language support
- Advanced notification system
- Integration with external services

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@schoolms.com or join our Slack channel.

---

**Built with ❤️ for modern educational institutions**

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
