/**
 * @jest-environment jsdom
 */

import LoginUI from '../views/LoginUI';
import Login from '../containers/Login.js';
import { ROUTES } from '../constants/routes';
import { fireEvent, screen } from '@testing-library/dom';
import { ROUTES_PATH } from '../constants/routes';

describe('Given that I am a user on login page', () => {
  describe('When I do not fill fields and I click on employee button Login In', () => {
    test('Then It should renders Login page', () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId('employee-email-input');
      expect(inputEmailUser.value).toBe('');

      const inputPasswordUser = screen.getByTestId('employee-password-input');
      expect(inputPasswordUser.value).toBe('');

      const form = screen.getByTestId('form-employee');
      const handleSubmit = jest.fn(e => e.preventDefault());

      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId('form-employee')).toBeTruthy();
    });
  });

  describe('When I do fill fields in incorrect format and I click on employee button Login In', () => {
    test('Then It should renders Login page', () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId('employee-email-input');
      fireEvent.change(inputEmailUser, { target: { value: 'pasunemail' } });
      expect(inputEmailUser.value).toBe('pasunemail');

      const inputPasswordUser = screen.getByTestId('employee-password-input');
      fireEvent.change(inputPasswordUser, { target: { value: 'azerty' } });
      expect(inputPasswordUser.value).toBe('azerty');

      const form = screen.getByTestId('form-employee');
      const handleSubmit = jest.fn(e => e.preventDefault());

      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId('form-employee')).toBeTruthy();
    });
  });

  describe('When I provide an invalid email format and I click on employee button Login In', () => {
    test('Then it should display an error message and prevent submission', () => {
      // Injecter le DOM de la page de connexion
      document.body.innerHTML = LoginUI();

      // Récupérer les éléments du DOM
      const inputEmailUser = screen.getByTestId('employee-email-input');
      const inputPasswordUser = screen.getByTestId('employee-password-input');
      const form = screen.getByTestId('form-employee');
      const errorMessage = screen.getByTestId('employee-error-message');

      // Simuler un email invalide
      fireEvent.change(inputEmailUser, { target: { value: 'invalidemail' } });
      fireEvent.change(inputPasswordUser, { target: { value: 'password123' } });

      // Initialiser Login et handleSubmit
      const onNavigate = jest.fn();
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION: '',
        store: null,
      });

      const handleSubmitEmployee = jest.fn(login.handleSubmitEmployee);
      form.addEventListener('submit', handleSubmitEmployee);

      // Soumettre le formulaire
      fireEvent.submit(form);

      // Vérifier le message d'erreur
      expect(errorMessage.textContent).toBe('Invalid email format');

      // Vérifier que la soumission est arrêtée
      expect(handleSubmitEmployee).toHaveBeenCalled();
      expect(onNavigate).not.toHaveBeenCalled();
    });
  });

  describe('When I do fill fields in correct format and I click on employee button Login In', () => {
    test('Then I should be identified as an Employee in app', () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: 'johndoe@email.com',
        password: 'azerty',
      };

      const inputEmailUser = screen.getByTestId('employee-email-input');
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId('employee-password-input');
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId('form-employee');

      // localStorage should be populated with form data
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = '';

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: inputData.email,
          password: inputData.password,
          status: 'connected',
        })
      );
    });

    test('It should renders Bills page', () => {
      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
    });
  });
});

describe('Given that I am a user on login page', () => {
  describe('When I do not fill fields and I click on admin button Login In', () => {
    test('Then It should renders Login page', () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId('admin-email-input');
      expect(inputEmailUser.value).toBe('');

      const inputPasswordUser = screen.getByTestId('admin-password-input');
      expect(inputPasswordUser.value).toBe('');

      const form = screen.getByTestId('form-admin');
      const handleSubmit = jest.fn(e => e.preventDefault());

      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId('form-admin')).toBeTruthy();
    });
  });

  describe('When I do fill fields in incorrect format and I click on admin button Login In', () => {
    test('Then it should renders Login page', () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId('admin-email-input');
      fireEvent.change(inputEmailUser, { target: { value: 'pasunemail' } });
      expect(inputEmailUser.value).toBe('pasunemail');

      const inputPasswordUser = screen.getByTestId('admin-password-input');
      fireEvent.change(inputPasswordUser, { target: { value: 'azerty' } });
      expect(inputPasswordUser.value).toBe('azerty');

      const form = screen.getByTestId('form-admin');
      const handleSubmit = jest.fn(e => e.preventDefault());

      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId('form-admin')).toBeTruthy();
    });
  });

  describe('When I do fill fields in correct format and I click on admin button Login In', () => {
    test('Then I should be identified as an HR admin in app', () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: 'Admin',
        email: 'johndoe@email.com',
        password: 'azerty',
        status: 'connected',
      };

      const inputEmailUser = screen.getByTestId('admin-email-input');
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId('admin-password-input');
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId('form-admin');

      // localStorage should be populated with form data
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = '';

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({
          type: 'Admin',
          email: inputData.email,
          password: inputData.password,
          status: 'connected',
        })
      );
    });

    test('It should renders HR dashboard page', () => {
      expect(screen.queryByText('Validations')).toBeTruthy();
    });
  });
  describe('Given that login fails', () => {
    test('Then it should call createUser to create a new user', async () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId('employee-email-input');
      const inputPasswordUser = screen.getByTestId('employee-password-input');
      const form = screen.getByTestId('form-employee');

      fireEvent.change(inputEmailUser, { target: { value: 'johndoe@email.com' } });
      fireEvent.change(inputPasswordUser, { target: { value: 'password123' } });

      const onNavigate = jest.fn();

      // Mock Login instance
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION: '',
        store: null,
      });

      // Simuler l'échec de la méthode login
      login.login = jest.fn().mockRejectedValue(new Error('Login failed'));

      // Mock de la méthode createUser
      login.createUser = jest.fn().mockResolvedValue({});

      const handleSubmitEmployee = jest.fn(login.handleSubmitEmployee);
      form.addEventListener('submit', handleSubmitEmployee);

      // Soumettre le formulaire
      fireEvent.submit(form);

      // Attendre que la Promise soit résolue
      await new Promise(process.nextTick);

      // Vérifier que createUser a été appelée
      expect(login.createUser).toHaveBeenCalled();

      // Vérifier que onNavigate a été appelée après la création de l'utilisateur
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });
  });
  describe('When I call createUser', () => {
    test('Then it should create the user and call login', async () => {
      document.body.innerHTML = LoginUI();

      const user = {
        type: 'Employee',
        email: 'johndoe@email.com',
        password: 'password123',
      };

      // Mock de `this.store.users().create`
      const mockCreate = jest.fn().mockResolvedValue({});
      const mockLogin = jest.fn();

      const store = {
        users: () => ({
          create: mockCreate,
        }),
      };

      const onNavigate = jest.fn();
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION: '',
        store: store,
      });

      // Mock de la méthode `login`
      login.login = mockLogin;

      // Appeler `createUser` avec un utilisateur
      await login.createUser(user);

      // Vérifier que `users().create` a été appelée avec les bonnes données
      expect(mockCreate).toHaveBeenCalledWith({
        data: JSON.stringify({
          type: user.type,
          name: user.email.split('@')[0],
          email: user.email,
          password: user.password,
        }),
      });

      // Vérifier que `login` a été appelé après la création de l'utilisateur
      expect(mockLogin).toHaveBeenCalledWith(user);
    });
  });
  describe("When the store is not defined", () => {
    test("Then createUser should return null", async () => {
      document.body.innerHTML = LoginUI();
  
      const user = {
        type: "Employee",
        email: "johndoe@email.com",
        password: "password123",
      };
  
      // Initialiser Login avec un store undefined
      const onNavigate = jest.fn();
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION: "",
        store: null, // Store non défini
      });
  
      // Appeler la méthode createUser
      const result = await login.createUser(user);
  
      // Vérifier que la méthode retourne null
      expect(result).toBeNull();
    });
  });  
});
