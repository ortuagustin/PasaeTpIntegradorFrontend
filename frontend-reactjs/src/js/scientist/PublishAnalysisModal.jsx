import React from 'react';

// Funciones
import { actionModal } from '../functions_util';

/**
 * Renderiza el modal con un cartel de confirmacion de publicacion
 * @param {string} modalId Id del modal
 * @param {number} analisysId Id de la analisis a borrar
 * @param {string} analysisDescription Nombre de la analisis a borrar
 * @param {Function} getAnalysis Funcion para refrescar la tabla
 */
export default class PublishAnalysisModal extends React.Component {
    constructor(props) {
        super(props);

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.publish = this.publish.bind(this);
    }

    /**
     * Publica un analisis que se encuentra en estado borrador
     */
    publish() {
        let self = this;

        $.ajax({
            url: 'https://pasae-backend.herokuapp.com/analysis/publish/' + self.props.analisysId,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            type: 'PATCH'
        }).done(function () {
            self.props.getAnalysis(); // Refresco la tabla
            actionModal(self.props.modalId, 'hide'); // Escondo el modal
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert('Error al publicar el analisis, intente nuevamente más tarde.');
            console.log(jqXHR, textStatus, errorThrown);
        });
    }

    render() {
        return(
            <div className="modal fade" id={this.props.modalId} tabIndex="-1" role="dialog" aria-labelledby={this.props.modalId} aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Publicar análisis</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="col text-center">
                                <h4>¿Está seguro que desea publicar el analisis <strong>{this.props.analysisDescription}</strong>? Esta acción es <strong>irreversible</strong></h4>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-success" onClick={this.publish}>Publicar</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}