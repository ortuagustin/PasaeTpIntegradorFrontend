import React from 'react';

// Funciones
import { actionModal } from '../functions_util';

/**
 * Renderiza el modal con un cartel de confirmacion de eliminacion
 * @param {string} modalId Id del modal
 * @param {number} patientId Id del paciente a borrar
 * @param {string} name Nombre del paciente a borrar
 * @param {Function} getPatients Funcion para refrescar la tabla
 */
class DeletePatientModal extends React.Component {
    constructor(props) {
        super(props);

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.removePatient = this.removePatient.bind(this);
    }

    /**
     * Hace un request al server para eliminar un paciente
     */
    removePatient() {
        let self = this;

        $.ajax({
            url: 'https://pasae-backend.herokuapp.com/patients/' + self.props.patientId,
            contentType: "application/json; charset=utf-8",
            type: 'DELETE',
        }).done(function () {
            self.props.getPatients(); // Refresco la tabla
            actionModal(self.props.modalId, 'hide'); // Escondo el modal
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert("Error al eliminar al paciente. Intente nuevamente más tarde");
            console.log(jqXHR, textStatus, errorThrown);
        });
    }

    render() {
        return(
            <div className="modal fade" id={this.props.modalId} tabIndex="-1" role="dialog" aria-labelledby={this.props.modalId} aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Eliminar paciente</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="col text-center">
                                <h4>¿Está seguro que desea eliminar al paciente <strong>{this.props.name}</strong></h4>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-primary" onClick={this.removePatient}>Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default DeletePatientModal;