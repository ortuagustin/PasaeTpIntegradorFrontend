import React from 'react';

// Funciones
import { actionModal } from '../functions_util';

/**
 * Renderiza el modalcon un cartel de confirmacion de eliminacion
 * @param {string} modalId Id del modal
 * @param {number} userId Id del usuario a borrar
 * @param {string} username Username del usuario a borrar
 * @param {Function} getUsers Funcion para refrescar la tabla
 */
class DeleteUserModal extends React.Component {
    constructor(props) {
        super(props);

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.removeUser = this.removeUser.bind(this);
    }

    /**
     * Hace un request al server para eliminar un usuario
     */
    removeUser() {
        let self = this;
        $.ajax({
            url: 'https://pasae-backend.herokuapp.com/admin/users/' + self.props.userId,
            contentType: "application/json; charset=utf-8",
            type: 'DELETE',
        }).done(function () {
            self.props.getUsers(); // Refresco la tabla
            actionModal(self.props.modalId, 'hide'); // Escondo el modal
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert("Error al eliminar al usuario. Intente nuevamente más tarde");
            console.log(jqXHR, textStatus, errorThrown);
        });
    }

    render() {
        return(
            <div className="modal fade" id={this.props.modalId} tabIndex="-1" role="dialog" aria-labelledby={this.props.modalId} aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Eliminar usuario</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="col text-center">
                                <h4>¿Está seguro que desea eliminar el usuario <strong>{this.props.username}</strong></h4>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-primary" onClick={this.removeUser}>Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default DeleteUserModal;