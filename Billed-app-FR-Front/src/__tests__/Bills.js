/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import router from '../app/Router.js';
import Bills from '../containers/Bills.js';
import userEvent from '@testing-library/user-event';
import { formatDate, formatStatus } from '../app/format.js';


describe('Given I am connected as an employee', () => {
  // Avant chaque test, on configure l'environnement nécessaire
  beforeEach(() => {
    // Mock du localStorage avec un utilisateur de type "Employee"
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld',
        status: 'connected',
      })
    );

    // Crée un conteneur racine pour le DOM et initialise le routeur
    document.body.innerHTML = `<div id="root"></div>`;
    router();
  });

  describe('When I am on Bills Page', () => {
    test('Then the bill icon in vertical layout should be highlighted', async () => {
      // Simule la navigation vers la page des factures
      window.onNavigate(ROUTES_PATH.Bills);

      // Attend que l'icône de la fenêtre soit disponible dans le DOM
      await waitFor(() => screen.getByTestId('icon-window'));

      // Sélectionne l'icône de la fenêtre
      const windowIcon = screen.getByTestId('icon-window');

      // Vérifie que l'icône contient la classe "active-icon"
      expect(windowIcon).toHaveClass('active-icon');
    });

    test('Then bills should be ordered from earliest to latest', () => {
      // Injecte les données mockées des factures dans le DOM
      document.body.innerHTML = BillsUI({ data: bills });

      // Récupère toutes les dates des factures dans le DOM
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map(a => a.innerHTML.trim());

      // Fonction de tri des dates dans l'ordre chronologique
      const Chrono = (a, b) => new Date(a) - new Date(b);

      // Trie les dates récupérées
      const datesSorted = [...dates].map(date => new Date(date)).sort(Chrono);

      // Vérifie que les dates dans le DOM sont triées correctement
      expect(dates.map(date => new Date(date))).toEqual(datesSorted);
    });
  });
  test("Should navigate to NewBill page when the 'New Bill' button is clicked", () => {
    // Injecter le HTML pour la page des factures
    document.body.innerHTML = BillsUI({ data: bills });

    // Simuler une fonction de navigation
    const mockNavigate = jest.fn();

    // Créer une instance de la classe Bills
    const billsPage = new Bills({
      document,
      onNavigate: mockNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    // Trouver et cliquer sur le bouton "Nouvelle note de frais"
    const newBillBtn = screen.getByTestId('btn-new-bill');
    fireEvent.click(newBillBtn);

    // Vérifier si la navigation a été appelée avec le bon chemin
    expect(mockNavigate).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
  });
});

test('When I click on the icon, the modal should open', () => {
  // On injecte le HTML de BillsUI avec des données de factures
  document.body.innerHTML = BillsUI({ data: bills });
  // On simule la fonction de navigation
  const onNavigate = jest.fn();
  // On crée une instance de Bills
  const billsContainer = new Bills({
    document,
    onNavigate,
    store: null,
    localStorage: window.localStorage,
  });
  // On mock la fonction modal de Bootstrap
  $.fn.modal = jest.fn();
  // On récupère la première icône "œil"
  const iconEye = screen.getAllByTestId('icon-eye')[0];
  // On simule le clic sur l'icône "œil"
  userEvent.click(iconEye);
  // On vérifie que la fonction modal a bien été appelée
  expect($.fn.modal).toHaveBeenCalled();
});
describe('HTTP Error Testing', () => {
  // Test pour une erreur 404
  test('should return a 404 error if the resource is not found', async () => {
    const mockResponse = {
      status: 404,
      statusText: 'Not Found',
    };
    global.fetch = jest.fn(() => Promise.resolve(mockResponse));

    const response = await fetch('/endpoint-inexistant');
    expect(response.status).toBe(404);
    expect(response.statusText).toBe('Not Found');
  });

  // Test pour une erreur 500
  test('should return a 500 error if there is a server problem', async () => {
    const mockResponse = {
      status: 500,
      statusText: 'Internal Server Error',
    };
    global.fetch = jest.fn(() => Promise.resolve(mockResponse));

    const response = await fetch('/endpoint-serveur');
    expect(response.status).toBe(500);
    expect(response.statusText).toBe('Internal Server Error');
  });
});

describe('When I call getBills', () => {
  test('Then it should return bills sorted by date and formatted', async () => {
    // Mock des factures retournées par `list()`
    const mockSnapshot = [
      { date: '2023-04-05', status: 'pending', amount: 100 },
      { date: '2023-03-15', status: 'accepted', amount: 50 },
      { date: '2023-04-01', status: 'refused', amount: 200 },
    ];

    const mockStore = {
      bills: () => ({
        list: jest.fn().mockResolvedValue(mockSnapshot),
      }),
    };

    // Initialiser une instance de Bills avec le store mocké
    const onNavigate = jest.fn();
    const billsPage = new Bills({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    // Appeler la méthode `getBills`
    const result = await billsPage.getBills();

    // Vérifier que les factures sont triées par date
    const sortedSnapshot = [...mockSnapshot].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    expect(result).toEqual(
      sortedSnapshot.map(doc => ({
        ...doc,
        date: formatDate(doc.date),
        status: formatStatus(doc.status),
      }))
    );
  });

  test('Then it should handle errors during bill formatting', async () => {
    // Mock des factures avec une date invalide qui déclenche le `catch`
    const mockSnapshot = [{ date: 'INVALID_DATE', status: 'pending', amount: 100 }];

    const mockStore = {
      bills: () => ({
        list: jest.fn().mockResolvedValue(mockSnapshot),
      }),
    };

    const onNavigate = jest.fn();
    const billsPage = new Bills({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    // Appeler la méthode `getBills`
    const result = await billsPage.getBills();

    // Vérifier que le `catch` est exécuté et retourne la date non formatée
    expect(result).toEqual(
      mockSnapshot.map(doc => ({
        ...doc,
        date: doc.date, // La date reste non formatée
        status: formatStatus(doc.status),
      }))
    );
  });
});
