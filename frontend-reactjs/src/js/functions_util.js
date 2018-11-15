/* En este archivo se dejan funciones genericas utiles para todas las clases */

/**
 * Muestra/esconde un modal especifico
 * @param {string} modalId Modal del id que se va a abrir
 * @param {string} modalAction 'show' o 'hide' para mostrar/esconder el modal
 */
function actionModal(modalId, modalAction) {
    $('#' + modalId).modal(modalAction);
}

export {
    actionModal
}