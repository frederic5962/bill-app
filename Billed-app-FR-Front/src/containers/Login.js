import { ROUTES_PATH } from '../constants/routes.js';
export let PREVIOUS_LOCATION = '';

// we use a class so as to test its methods in e2e tests
export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document;
    this.localStorage = localStorage;
    this.onNavigate = onNavigate;
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION;
    this.store = store;
    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`);
    formEmployee.addEventListener('submit', this.handleSubmitEmployee);
    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`);
    formAdmin.addEventListener('submit', this.handleSubmitAdmin);
  }
  handleSubmitEmployee = e => {
    e.preventDefault();

    const emailInput = e.target.querySelector(
      `input[data-testid="employee-email-input"]`
    );
    const passwordInput = e.target.querySelector(
      `input[data-testid="employee-password-input"]`
    );
    const errorMessage = e.target.querySelector(
      `div[data-testid="employee-error-message"]`
    );

    const user = {
      type: 'Employee',
      email: emailInput.value,
      password: passwordInput.value,
      status: 'connected',
    };

    // Validation de l'email
    if (!this.isValidEmail(user.email)) {
      errorMessage.textContent = 'Invalid email format';
      return;
    }

    // Nettoyage du message d'erreur (si tout est valide)
    errorMessage.textContent = '';

    this.localStorage.setItem('user', JSON.stringify(user));
    this.login(user)
      .catch(err => this.createUser(user))
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills']);
        this.PREVIOUS_LOCATION = ROUTES_PATH['Bills'];
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
        this.document.body.style.backgroundColor = '#fff';
      });
  };

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  handleSubmitAdmin = e => {
    e.preventDefault();

    const emailInput = e.target.querySelector(`input[data-testid="admin-email-input"]`);
    const passwordInput = e.target.querySelector(
      `input[data-testid="admin-password-input"]`
    );
    const errorMessage = e.target.querySelector(`div[data-testid="admin-error-message"]`);

    const user = {
      type: 'Admin',
      email: emailInput.value,
      password: passwordInput.value,
      status: 'connected',
    };

    errorMessage.textContent = '';

    this.localStorage.setItem('user', JSON.stringify(user));
    this.login(user)
      .catch(err => this.createUser(user))
      .then(() => {
        this.onNavigate(ROUTES_PATH['Dashboard']);
        this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard'];
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
        document.body.style.backgroundColor = '#fff';
      });
  };

  // not need to cover this function by tests
  login = user => {
    if (this.store) {
      return this.store
        .login(
          JSON.stringify({
            email: user.email,
            password: user.password,
          })
        )
        .then(({ jwt }) => {
          localStorage.setItem('jwt', jwt);
        });
    } else {
      return null;
    }
  };

  // not need to cover this function by tests
  createUser = user => {
    if (this.store) {
      return this.store
        .users()
        .create({
          data: JSON.stringify({
            type: user.type,
            name: user.email.split('@')[0],
            email: user.email,
            password: user.password,
          }),
        })
        .then(() => {
          console.log(`User with ${user.email} is created`);
          return this.login(user);
        });
    } else {
      return null;
    }
  };
}
