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
    const newBillBtn = screen.getByTestId("btn-new-bill");
    fireEvent.click(newBillBtn);
  
    // Vérifier si la navigation a été appelée avec le bon chemin
    expect(mockNavigate).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
  });  
});

