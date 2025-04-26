import { Document, User, Notification } from '../types';
import { format, subDays } from 'date-fns';

// Mock Users
export const currentUser: User = {
  id: 'u1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  organization: 'TechSolutions India',
  role: 'admin',
  profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
};

export const users: User[] = [
  currentUser,
  {
    id: 'u2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    organization: 'Legal Associates',
    role: 'user',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 'u3',
    name: 'Amit Kumar',
    email: 'amit.kumar@example.com',
    organization: 'Finance Corp',
    role: 'user',
    profileImage: 'https://randomuser.me/api/portraits/men/68.jpg'
  },
  {
    id: 'u4',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    organization: 'TechSolutions India',
    role: 'user',
    profileImage: 'https://randomuser.me/api/portraits/women/65.jpg'
  }
];

// Mock Documents
export const documents: Document[] = [
  {
    id: 'd1',
    title: 'Sales Agreement - ABC Corp',
    description: 'Final sales agreement for the Q2 product delivery',
    createdAt: format(subDays(new Date(), 5), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    status: 'pending',
    ownerId: 'u1',
    signers: [
      {
        id: 'u1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        status: 'signed',
        role: 'Seller',
        signMethod: 'aadhaar',
        signatureId: 's1',
        signedAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss')
      },
      {
        id: 'u2',
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        status: 'pending',
        role: 'Buyer',
      }
    ],
    fileUrl: '/documents/agreement.pdf',
    fileType: 'application/pdf',
    fileSize: 2457600,
    isEncrypted: true,
    blockchainVerified: true,
    auditTrail: [
      {
        id: 'a1',
        timestamp: format(subDays(new Date(), 5), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        actorId: 'u1',
        actorName: 'Rahul Sharma',
        action: 'Document Created',
        ipAddress: '103.25.XX.XX',
        deviceInfo: 'Chrome/Windows'
      },
      {
        id: 'a2',
        timestamp: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        actorId: 'u1',
        actorName: 'Rahul Sharma',
        action: 'Document Signed',
        details: 'Signed using Aadhaar eSign',
        ipAddress: '103.25.XX.XX',
        deviceInfo: 'Chrome/Windows'
      },
      {
        id: 'a3',
        timestamp: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        actorId: 'system',
        actorName: 'System',
        action: 'Email Notification',
        details: 'Reminder sent to Priya Patel'
      }
    ]
  },
  {
    id: 'd2',
    title: 'Employment Contract - New Hire',
    description: 'Employment agreement for new software developer',
    createdAt: format(subDays(new Date(), 10), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    status: 'completed',
    ownerId: 'u1',
    signers: [
      {
        id: 'u1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        status: 'signed',
        role: 'HR Manager',
        signMethod: 'dsc',
        signatureId: 's2',
        signedAt: format(subDays(new Date(), 8), 'yyyy-MM-dd\'T\'HH:mm:ss')
      },
      {
        id: 'u3',
        name: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        status: 'signed',
        role: 'Employee',
        signMethod: 'aadhaar',
        signatureId: 's3',
        signedAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss')
      }
    ],
    fileUrl: '/documents/contract.pdf',
    fileType: 'application/pdf',
    fileSize: 1843200,
    isEncrypted: true,
    blockchainVerified: true,
    auditTrail: [
      {
        id: 'a4',
        timestamp: format(subDays(new Date(), 10), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        actorId: 'u1',
        actorName: 'Rahul Sharma',
        action: 'Document Created',
        ipAddress: '103.25.XX.XX',
        deviceInfo: 'Chrome/Windows'
      },
      {
        id: 'a5',
        timestamp: format(subDays(new Date(), 8), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        actorId: 'u1',
        actorName: 'Rahul Sharma',
        action: 'Document Signed',
        details: 'Signed using DSC',
        ipAddress: '103.25.XX.XX',
        deviceInfo: 'Chrome/Windows'
      },
      {
        id: 'a6',
        timestamp: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        actorId: 'u3',
        actorName: 'Amit Kumar',
        action: 'Document Signed',
        details: 'Signed using Aadhaar eSign',
        ipAddress: '45.112.XX.XX',
        deviceInfo: 'Safari/MacOS'
      },
      {
        id: 'a7',
        timestamp: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        actorId: 'system',
        actorName: 'System',
        action: 'Document Completed',
        details: 'All parties have signed'
      }
    ]
  },
  {
    id: 'd3',
    title: 'NDA - Project Falcon',
    description: 'Non-disclosure agreement for Project Falcon',
    createdAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    updatedAt: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    status: 'draft',
    ownerId: 'u1',
    signers: [
      {
        id: 'u1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        status: 'pending',
        role: 'Project Manager'
      },
      {
        id: 'u4',
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        status: 'pending',
        role: 'Partner'
      }
    ],
    fileUrl: '/documents/nda.pdf',
    fileType: 'application/pdf',
    fileSize: 921600,
    isEncrypted: true,
    auditTrail: [
      {
        id: 'a8',
        timestamp: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
        actorId: 'u1',
        actorName: 'Rahul Sharma',
        action: 'Document Created',
        ipAddress: '103.25.XX.XX',
        deviceInfo: 'Chrome/Windows'
      }
    ]
  }
];

// Mock Notifications
export const notifications: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'Document Signed',
    message: 'Amit Kumar has signed "Employment Contract"',
    type: 'success',
    isRead: false,
    createdAt: format(subDays(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    link: '/dashboard'
  },
  {
    id: 'n2',
    userId: 'u1',
    title: 'Signature Reminder',
    message: 'Priya Patel has not signed "Sales Agreement" yet',
    type: 'warning',
    isRead: false,
    createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    link: '/dashboard'
  },
  {
    id: 'n3',
    userId: 'u1',
    title: 'Document Viewed',
    message: 'Sneha Reddy viewed "NDA - Project Falcon"',
    type: 'info',
    isRead: true,
    createdAt: format(subDays(new Date(), 3), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    link: '/dashboard'
  }
];