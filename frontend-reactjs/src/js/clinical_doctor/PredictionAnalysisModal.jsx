import React from 'react';

/**
 *
 * @param {*} props Props del componente
 */
export default class PredictionAnalysisModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            result: null
        };

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.predict = this.predict.bind(this);
    }

    /**
     * Genera la prediccion para el analisis seleccionado
     */
    predict() {
        let self = this;

        // Cargo los fenotipos numericos y categoricos
        self.setState({ loading: true }, () => {
            $.ajax({
                url: 'https://pasae-backend.herokuapp.com/prediction/',
                type: 'PUT',
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({
                   analysisId: self.props.analysisId,
                   snps: self.props.snps.map((snp) => {
                        return {
                            snp: snp.snp.replace('rs', '').trim(), // Limpio el nombr del SNP por el p$#% de Agus
                            value: snp.value
                        }
                   })
                })
            }).done(function (jsonReponse, textStatus, jqXHR) {
                if (jqXHR.status == 200) {
                    self.setState({ result: jsonReponse });
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                alert('Ocurrió un error al predecir, intente nuevamente más tarde.');
                console.log(jqXHR, textStatus, errorThrown);
            }).always(function () {
                self.setState({ loading: false });
            });
        });
    }

    isValid() {
        return this.props.snps && !this.props.snps.some((snp) => !snp.value);
    }

    render() {
        const snps = this.props.snps ? this.props.snps : [];
        const listOfSnp = snps.map((snp, idx) => {
            return (
                <tr key={snp.snp}>
                    <td>{snp.snp}</td>
                    <td>
                        <input type="text"
                            value={snp.value ? snp.value : ''}
                            className="form-control"
                            onChange={(e) => this.props.changeSnpsValue(e, idx)}
                            pattern="[ACTGactg]*"
                            maxLength="2"
                        />
                    </td>
                </tr>
            );
        });

        return (
            <div className="modal fade" id={this.props.modalId} tabIndex="-1" role="dialog" aria-labelledby={this.props.modalId} aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Predecir</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">

                            {/* Input con la descripcion del analisis */}
                            <div className="row margin-top">
                                <div className="col">
                                    <div className="form-group">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th scope="col">SNP</th>
                                                    <th scope="col">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                { listOfSnp }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Resultado */}
                            {this.state.result != null &&
                                <div className="alert alert-success" role="alert">
                                    <h4>
                                        Tipo:&nbsp;
                                        <strong>
                                            {this.state.result.phenotypeKind == 'Categoric' ? 'Categorico' : 'Numérico'}
                                        </strong>
                                    </h4>
                                    <h4>
                                        Nombre:&nbsp;
                                        <strong>
                                            {this.state.result.phenotypeName}
                                        </strong>
                                    </h4>
                                    <h4>
                                        Valor:&nbsp;
                                        <strong>
                                            {this.state.result.phenotypeValue}
                                        </strong>
                                    </h4>
                                </div>
                            }

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                            <button type="button" className="btn btn-primary" disabled={!this.isValid()} onClick={this.predict}>
                                Predecir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}