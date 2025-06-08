import { describe, it, expect, vi } from 'vitest';

describe('AuthPage', () => {

  it('renders the login form by default', () => {
    render(
      <TestWrapper>
        <AuthPage />
      </TestWrapper>
    );

    expect(screen.getByText('CyberDefense Simulator')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('shows login form fields', () => {
    render(
      <TestWrapper>
        <AuthPage />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('switches to register form when Sign Up tab is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <AuthPage />
      </TestWrapper>
    );

    await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i)).toHaveLength(2); // Password and Confirm Password
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('submits login form with correct data', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({});

    render(
      <TestWrapper>
        <AuthPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('submits register form with correct data', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({});

    render(
      <TestWrapper>
        <AuthPage />
      </TestWrapper>
    );

    // Switch to register tab
    await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john.doe@example.com');
    await user.type(passwordInput, 'StrongPass123!');
    await user.type(confirmPasswordInput, 'StrongPass123!');
    await user.click(submitButton);

    expect(mockRegister).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'StrongPass123!',
    });
  });

  it('shows password strength indicator', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AuthPage />
      </TestWrapper>
    );

    // Switch to register tab
    await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

    const passwordInput = screen.getAllByLabelText(/password/i)[0];
    
    await user.type(passwordInput, 'weak');
    expect(screen.getByText(/Very Weak|Weak/i)).toBeInTheDocument();

    await user.clear(passwordInput);
    await user.type(passwordInput, 'StrongPass123!');
    expect(screen.getByText(/Strong/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AuthPage />
      </TestWrapper>
    );

    // Switch to register tab
    await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

    const passwordInputs = screen.getAllByLabelText(/password/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /create account/i });

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
    await user.type(passwordInput, 'StrongPass123!');
    await user.type(confirmPasswordInput, 'DifferentPass123!');
    await user.click(submitButton);

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Password mismatch',
      description: 'Passwords do not match. Please try again.',
      variant: 'destructive',
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AuthPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows success toast on successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({});

    render(
      <TestWrapper>
        <AuthPage />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Welcome back!',
        description: 'You have been successfully logged in.',
      });
    });
  });

  it('shows success toast on successful registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({});

    render(
      <TestWrapper>
        <AuthPage />
      </TestWrapper>
    );

    // Switch to register tab
    await user.click(screen.getByRole('tab', { name: 'Sign Up' }));

    // Fill form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
    
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'StrongPass123!');
    await user.type(passwordInputs[1], 'StrongPass123!');
    
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Account created!',
        description: 'Welcome to CyberDefense Simulator. Let\'s start your cybersecurity journey!',
      });
    });
  });
});
