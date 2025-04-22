/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { localStorageMock } from '../__mocks__/localStorage';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import mockStore from "../__mocks__/store";

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  window.localStorage.setItem(
    'user',
    JSON.stringify({ type: 'Employee', email: 'employee@test.tld', status: 'connected' })
  );

  describe('When I am on NewBill Page', () => {
    test('then the new invoice must be displayed', () => {
      //html pour le page NewBill
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion

      //Vérifie si presence du formulaire dans le dom
      const form = screen.getByTestId('form-new-bill');
      expect(form).toBeTruthy();
    });
  });
// Cas de soumission du formulaire avec des champs vides
describe("When I submit the form with empty inputs", () => {
  
  //la méthode update de l'API ne doit pas être appelée et une alerte doit s'afficher
  test("Then it should not call the API and display an alert", () => {
    
    // Charger le HTML de la page NewBill dans le DOM
    document.body.innerHTML = NewBillUI();

    // Simuler l'affichage des alertes pour éviter leur comportement par défaut
    jest.spyOn(window, "alert").mockImplementation(() => {});
    
    // Mock de la fonction update de l'API
    jest.spyOn(mockStore.bills(), "update").mockResolvedValue({});

    // Créer une instance de NewBill avec les dépendances nécessaires
    const onNavigate = jest.fn(); // Simule une navigation
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    // Récupérer le formulaire à partir du DOM
    const form = screen.getByTestId("form-new-bill");

    // Simuler des champs vides dans le formulaire
    fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "" } });
    fireEvent.change(screen.getByTestId("amount"), { target: { value: "" } });

    // Soumettre le formulaire
    fireEvent.submit(form);

    // Vérification : la méthode update de l'API ne doit pas être appelée
    expect(mockStore.bills().update).not.toHaveBeenCalled();

    // Vérification : une alerte doit s'afficher avec un message approprié
    expect(window.alert).toHaveBeenCalled();
  });
});

// Décrit le cas où l'utilisateur téléverse un fichier valide.
describe("When I upload a valid file", () => {

  // Teste que l'API est appelée avec les bonnes données pour un fichier valide.
  test("Then it should call the API with the correct data", async () => {

    // Insère l'interface utilisateur de la page dans le DOM.
    document.body.innerHTML = NewBillUI();

    // Mock de la méthode `create` pour simuler la réponse de l'API avec une URL de fichier.
    jest.spyOn(mockStore.bills(), "create").mockResolvedValue({ fileUrl: "test-url" });

    // Instancie une nouvelle instance de la classe NewBill.
    const newBill = new NewBill({
      document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: window.localStorage,
    });

    // Sélectionne l'input de fichier dans le formulaire.
    const fileInput = screen.getByTestId("file");

    // Crée un fichier simulé avec le bon type (`image/png`).
    const FileTest = new File(["content"], "valid.png", { type: "image/png" });

    // Simule le téléversement d'un fichier en déclenchant l'événement `change`.
    fireEvent.change(fileInput, { target: { files: [FileTest] } });

    await waitFor(() => {
      // Vérifie que la méthode `create` de l'API est appelée.
      expect(mockStore.bills().create).toHaveBeenCalled();

      // Récupère les données envoyées à l'API.
      const formData = mockStore.bills().create.mock.calls[0][0].data;

      // Vérifie que le fichier envoyé porte bien le nom "valid.png".
      expect(formData.get("file").name).toBe("valid.png");
    });
  });
});
});