import { ROUTES_PATH } from '../constants/routes.js';
import { formatDate, formatStatus } from '../app/format.js';
import Logout from './Logout.js';

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach(icon => {
        icon.addEventListener('click', () => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill']);
  };

  handleClickIconEye = icon => {
    const billUrl = icon.getAttribute('data-bill-url');
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5);
    $('#modaleFile')
      .find('.modal-body')
      .html(
        `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
      );
    $('#modaleFile').modal('show');
  };

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then(snapshot => {
          const bills = snapshot
  
  .sort((a, b) => new Date(a.date) - new Date(b.date));


        
          return bills.map(doc => {
            try {
              if (!doc.date) {
                console.warn('Facture sans date détectée :', doc);
              }

              return {
                ...doc,
                date: doc.date ? formatDate(doc.date) : 'Date inconnue',
                status: formatStatus(doc.status),
              };
            } catch (e) {
              console.error('Erreur de formatage pour', doc, e);
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status),
              };
            }
          });
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des factures :', error);
          return [];
        });
    }
  };
}
