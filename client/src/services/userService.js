const USER_API = import.meta.env.VITE_USER_API; // e.g., http://localhost:4000/api/users

class UserService {
  constructor() {
    this.token = null;
  }

  setToken(newToken) {
    this.token = newToken;
  }

  async signUp(userData) {
    const response = await fetch(`${USER_API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async signIn(credentials) {
    const response = await fetch(`${USER_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async getCurrentUser() {
    if (!this.token) throw new Error("No token set");
    const response = await fetch(`${USER_API}/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async getAllUsers() {
    if (!this.token) throw new Error("No token set");
    const response = await fetch(`${USER_API}/users`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
}

export const userService = new UserService();
