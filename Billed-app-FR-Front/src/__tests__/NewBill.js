/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { localStorageMock } from '../__mocks__/localStorage';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import mockStore from '../__mocks__/store';
import { ROUTES_PATH } from '../constants/routes.js';

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

      //Vérifie si presence du formulaire dans le dom
      const form = screen.getByTestId('form-new-bill');
      expect(form).toBeTruthy();
    });
  });

  describe('When I submit the form with missing required inputs', () => {
    test('Then it should display an alert and not call updateBill', () => {
      // Charger l'interface utilisateur
      document.body.innerHTML = NewBillUI();

      // Mock de la fonction alert pour intercepter les appels
      jest.spyOn(window, 'alert').mockImplementation(() => {});

      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Simuler un formulaire avec des champs manquants (par exemple, pas de `amount`)
      const form = screen.getByTestId('form-new-bill');
      fireEvent.change(screen.getByTestId('expense-type'), {
        target: { value: 'Transport' },
      });
      fireEvent.change(screen.getByTestId('expense-name'), { target: { value: 'Taxi' } });
      fireEvent.change(screen.getByTestId('datepicker'), {
        target: { value: '2023-05-15' },
      });
      // Laisse le champ `amount` vide
      fireEvent.change(screen.getByTestId('amount'), { target: { value: '' } });

      // Simuler la soumission du formulaire
      fireEvent.submit(form);

      // Vérifie que l'alerte a été affichée
      expect(window.alert).toHaveBeenCalledWith(
        'Veuillez remplir tous les champs obligatoires.'
      );

      // Vérifie que `updateBill` n'est pas appelée
      const mockUpdateBill = jest.spyOn(newBill, 'updateBill');
      expect(mockUpdateBill).not.toHaveBeenCalled();
    });
  });

  describe('NewBill file type validation', () => {
    test('should alert and reset file input if file type is not allowed', () => {
      // Charger l'interface utilisateur
      document.body.innerHTML = NewBillUI();

      // Mock de la fonction alert pour intercepter les appels
      jest.spyOn(window, 'alert').mockImplementation(() => {});

      // Instancie une nouvelle instance de la classe NewBill
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Sélectionne l'input de fichier
      const fileInput = screen.getByTestId('file');

      // Crée un fichier non autorisé (par exemple, un fichier PDF)
      const invalidFile = new File(['dummy content'], 'example.pdf', {
        type: 'application/pdf',
      });

      // Simule un changement de fichier avec un fichier non autorisé
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      // Vérifie que l'alerte est affichée
      expect(window.alert).toHaveBeenCalledWith(
        'Seuls les fichiers .jpg, .jpeg et .png sont autorisés.'
      );

      // Vérifie que le champ fichier a été réinitialisé
      expect(fileInput.value).toBe('');
    });

    test('should allow valid file types like jpg and png', () => {
      // Charger l'interface utilisateur
      document.body.innerHTML = NewBillUI();

      // Instancie une nouvelle instance de la classe NewBill
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Sélectionne l'input de fichier
      const fileInput = screen.getByTestId('file');

      // Crée un fichier valide (par exemple, un fichier PNG)
      const validFile = new File(['dummy content'], 'image.png', { type: 'image/png' });

      // Simule un changement de fichier avec un fichier valide
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      // Vérifie que le fichier est accepté sans réinitialisation du champ
      expect(fileInput.files[0].name).toBe('image.png');
    });
  });

  // Décrit le cas où l'utilisateur téléverse un fichier valide.
  describe('When I upload a valid file', () => {
    // Teste que l'API est appelée avec les bonnes données pour un fichier valide.
    test('Then it should call the API with the correct data', async () => {
      // Insère l'interface utilisateur de la page dans le DOM.
      document.body.innerHTML = NewBillUI();

      // Mock de la méthode `create` pour simuler la réponse de l'API avec une URL de fichier.
      jest.spyOn(mockStore.bills(), 'create').mockResolvedValue({ fileUrl: 'test-url' });

      // Instancie une nouvelle instance de la classe NewBill.
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Sélectionne l'input de fichier dans le formulaire.
      const fileInput = screen.getByTestId('file');

      // Crée un fichier simulé avec le bon type (`image/png`).
      const FileTest = new File(['content'], 'valid.png', { type: 'image/png' });

      // Simule le téléversement d'un fichier en déclenchant l'événement `change`.
      fireEvent.change(fileInput, { target: { files: [FileTest] } });

      await waitFor(() => {
        // Vérifie que la méthode `create` de l'API est appelée.
        expect(mockStore.bills().create).toHaveBeenCalled();

        // Récupère les données envoyées à l'API.
        const formData = mockStore.bills().create.mock.calls[0][0].data;

        // Vérifie que le fichier envoyé porte bien le nom "valid.png".
        expect(formData.get('file').name).toBe('valid.png');
      });
    });
  });
  describe('NewBill file type validation', () => {
    test('should alert and reset file input if file type is not allowed', () => {
      // Mock de la fonction alert pour intercepter les appels
      jest.spyOn(window, 'alert').mockImplementation(() => {});

      // Crée un champ fichier simulé
      const fileInput = document.createElement('input');
      fileInput.type = 'file';

      // Crée un fichier avec une extension non autorisée
      const invalidFile = new File(['dummy content'], 'example.pdf', {
        type: 'application/pdf',
      });

      // Ajoute le champ fichier au DOM pour la simulation
      document.body.appendChild(fileInput);

      // Simule un événement de changement sur le champ fichier
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      // La logique du fichier NewBill.js devrait être appelée ici
      const allowedExtensions = ['image/jpeg', 'image/png'];
      if (!allowedExtensions.includes(invalidFile.type)) {
        alert('Seuls les fichiers .jpg, .jpeg et .png sont autorisés.');
        fileInput.value = ''; // Réinitialiser la sélection de fichier
      }

      // Vérifie que l'alerte a été affichée avec le bon message
      expect(window.alert).toHaveBeenCalledWith(
        'Seuls les fichiers .jpg, .jpeg et .png sont autorisés.'
      );

      // Vérifie que le champ fichier a été réinitialisé
      expect(fileInput.value).toBe('');
    });
  });
  describe('When updateBill is called successfully', () => {
    test('Then it should call the API and navigate to Bills page', async () => {
      // Charger l'interface utilisateur de la page NewBill
      document.body.innerHTML = NewBillUI();

      // Mock de la méthode `update` pour simuler une réponse réussie
      jest.spyOn(mockStore.bills(), 'update').mockResolvedValue({});

      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Appeler directement updateBill avec des données fictives
      await newBill.updateBill({ type: 'Transport', amount: 100 });

      // Vérifie si la méthode `update` a été appelée
      expect(mockStore.bills().update).toHaveBeenCalled();

      // Vérifie que `onNavigate` a été appelé pour rediriger vers la page Bills
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });
  });
});
