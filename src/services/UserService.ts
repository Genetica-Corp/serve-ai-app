import { User, TeamMember, UserRole } from '../types';

class UserService {
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'operator@serveai.com',
      name: 'Alex Thompson',
      role: 'OPERATOR',
      avatar: 'https://i.pravatar.cc/150?img=1',
      storeId: 'store-001',
      storeName: 'Downtown Branch',
      permissions: ['ASSIGN_ALERTS', 'VIEW_ALL_ALERTS', 'MANAGE_TEAM'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      email: 'manager1@serveai.com',
      name: 'Sarah Chen',
      role: 'STORE_MANAGER',
      avatar: 'https://i.pravatar.cc/150?img=2',
      storeId: 'store-001',
      storeName: 'Downtown Branch',
      permissions: ['VIEW_ASSIGNED_ALERTS', 'RESOLVE_ALERTS'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '3',
      email: 'manager2@serveai.com',
      name: 'Mike Rodriguez',
      role: 'STORE_MANAGER',
      avatar: 'https://i.pravatar.cc/150?img=3',
      storeId: 'store-001',
      storeName: 'Downtown Branch',
      permissions: ['VIEW_ASSIGNED_ALERTS', 'RESOLVE_ALERTS'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '4',
      email: 'manager3@serveai.com',
      name: 'Emily Johnson',
      role: 'STORE_MANAGER',
      avatar: 'https://i.pravatar.cc/150?img=4',
      storeId: 'store-002',
      storeName: 'Uptown Branch',
      permissions: ['VIEW_ASSIGNED_ALERTS', 'RESOLVE_ALERTS'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  private mockTeamMembers: TeamMember[] = [
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'manager1@serveai.com',
      role: 'STORE_MANAGER',
      storeId: 'store-001',
      avatar: 'https://i.pravatar.cc/150?img=2',
      status: 'ACTIVE',
      lastActive: new Date(),
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      email: 'manager2@serveai.com',
      role: 'STORE_MANAGER',
      storeId: 'store-001',
      avatar: 'https://i.pravatar.cc/150?img=3',
      status: 'ACTIVE',
      lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    },
    {
      id: '4',
      name: 'Emily Johnson',
      email: 'manager3@serveai.com',
      role: 'STORE_MANAGER',
      storeId: 'store-002',
      avatar: 'https://i.pravatar.cc/150?img=4',
      status: 'ON_BREAK',
      lastActive: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    },
  ];

  async getCurrentUser(): Promise<User> {
    // In a real app, this would fetch from API based on auth token
    // For demo, return operator user by default
    return Promise.resolve(this.mockUsers[0]);
  }

  async getUserById(userId: string): Promise<User | null> {
    const user = this.mockUsers.find(u => u.id === userId);
    return Promise.resolve(user || null);
  }

  async getTeamMembers(operatorId: string): Promise<TeamMember[]> {
    // In a real app, this would fetch team members based on operator's permissions
    // For demo, return all store managers
    return Promise.resolve(this.mockTeamMembers);
  }

  async getAvailableAssignees(storeId?: string): Promise<TeamMember[]> {
    // Filter by store if provided
    let assignees = this.mockTeamMembers;
    if (storeId) {
      assignees = assignees.filter(m => m.storeId === storeId);
    }
    
    // Only return active team members
    return Promise.resolve(assignees.filter(m => m.status === 'ACTIVE'));
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'ON_BREAK'): Promise<void> {
    const member = this.mockTeamMembers.find(m => m.id === userId);
    if (member) {
      member.status = status;
      member.lastActive = new Date();
    }
    return Promise.resolve();
  }

  async login(email: string, password: string): Promise<User | null> {
    // Mock login - in real app would validate credentials
    const user = this.mockUsers.find(u => u.email === email);
    return Promise.resolve(user || null);
  }

  // Demo login methods for quick access
  async loginAsOperator(): Promise<User> {
    return Promise.resolve(this.mockUsers[0]);
  }

  async loginAsStoreManager(): Promise<User> {
    return Promise.resolve(this.mockUsers[1]);
  }
}

export default new UserService();