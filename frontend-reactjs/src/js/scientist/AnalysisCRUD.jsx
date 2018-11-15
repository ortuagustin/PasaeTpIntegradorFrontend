import React from 'react';

// Componentes
import AddAnalysisModal from './AddAnalysisModal.jsx';
import DeleteAnalysisModal from './DeleteAnalysisModal.jsx';
import PublishAnalysisModal from './PublishAnalysisModal.jsx';

// Librerias
import BootstrapTable from 'react-bootstrap-table-next'; // Tabla
import paginationFactory from 'react-bootstrap-table2-paginator'; // Paginacion en tabla
import overlayFactory from 'react-bootstrap-table2-overlay'; // Para la animacion de carga
import filterFactory from 'react-bootstrap-table2-filter';
import moment from 'moment';

// Funciones
import { actionModal } from '../functions_util';

// Iconos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons'

/**
 * Componente que renderiza el panel de CRUD de analisis
 */
export default class AnalysisCRUD extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            analysis: [],
            page: 1,
            sizePerPage: 10,
            totalSize: 0,
            selectedAnalysis: {},
            action: null,
            searchPhenotypeInput: '',
        }

        // Variables que no renderizan la vista
        this.addAnalysisModalId = 'add-analysis-modal';
        this.deleteAnalysisModalId = 'delete-analysis-modal';
        this.publishAnalysisModalId = 'publis-analysis-modal';

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.getAnalysis = this.getAnalysis.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    /**
     * Metodo que se ejecuta cuando termina de
     * renderizar el componente
     */
    componentDidMount() {
        this.getAnalysis();
    }

    /**
     * Obtiene los fenotipos via AJAX.
     * Para mas info acerca de los parametros: https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/table-props.html#ontablechange-function
     * @param {string} type Tipo de accion realizada en la tabla
     * @param {*} newState Atributos de la tabla actuales
     */
    getAnalysis(actionType = '', newState = {}) {
        let self = this;

        // Genero los parametros del request
        let pageNumber = newState.page ? newState.page : self.state.page;
        let sizePerPage = newState.sizePerPage ? newState.sizePerPage : self.state.sizePerPage;

        // Cargo los fenotipos numericos y categoricos
        self.setState({ loading: true }, () => {
            $.ajax({
                url: 'https://pasae-backend.herokuapp.com/analysis/',
                data: {
                    newestPage: pageNumber - 1,
                    newestSizePerPage: sizePerPage,
                    newestSortField: newState.sortField,
                    newestSortOrder: newState.sortOrder,
                    search: self.state.searchPhenotypeInput
                }
            }).done(function (jsonReponse, textStatus, jqXHR) {
                if (jqXHR.status == 200) {
                    self.setState({
                        analysis: jsonReponse.content,
                        page: pageNumber,
                        sizePerPage: sizePerPage,
                        totalSize: jsonReponse.totalElements
                    });
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR, textStatus, errorThrown);
            }).always(function () {
                self.setState({ loading: false });
            });
        });
    }

    /**
     * Cambia el estado de la accion que estamos realizando
     * (agregando o editando un usuario) para poder reutilizar
     * el modal de alta de usuario
     * @param {string} action 'add' o 'edit' para el modal
     */
    changeAction(action) {
        this.setState({ action: action }, () => {
            // Una vez que cambiamos de accion, abrimos el modal de alta/edicion
            actionModal(this.addAnalysisModalId, 'show');
        });
    }

    /**
     * Metodo que se ejecuta cuando los inputs cambian.
     * Sirve para refrescar el state
     * @param {Event} e Evento del cambio del input
     */
    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value }, () => {
            this.getAnalysis();
        });;
    }

    /**
     * Selecciona el Analisis actual y ejecuta una accion
     * @param {*} analysis Analisis a seleccionar
     * @param {*} action Editar | Eliminar el Analisis seleccionado
     */
    selectAndAction(analysis, action) {
        this.setState({ selectedAnalysis: analysis }, () => {
            if (action == 'publish') {
                this.confirmPublish();
            } else {
                if (action == 'delete') {
                    actionModal(this.deleteAnalysisModalId, 'show');
                }
            }
        });
    }

    /**
     * Muestro el modal de confirmacion de publicacion
     */
    confirmPublish() {
        actionModal(this.publishAnalysisModalId, 'show');
    }

    render() {
        const columns = [
            {
                dataField: 'description',
                text: 'Descripción',
                sort: true,
            }, {
                dataField: 'state',
                text: 'Estado',
                sort: true,
            }, {
                dataField: 'date',
                text: 'Fecha',
                sort: true,
                formatter: (cell, row) => moment(row.date).format('DD/MM/YYYY HH:mm:ss')
            }, {
                dataField: 'noField',
                text: 'Acciones',
                formatter: (cell, row) => {
                    return (
                        <div>
                            {row.state == 'DRAFT' &&
                                <span className="animated-ease-1seg green-hover" title="Publicar" onClick={() => this.selectAndAction(row, 'publish')}>
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                </span>
                            }
                            <span className="margin-left animated-ease-1seg red-hover" title="Eliminar" onClick={() => this.selectAndAction(row, 'delete')}>
                                <FontAwesomeIcon icon={faTimes} />
                            </span>
                        </div>
                    );
                }
            }
        ];

        // Seteos de paginacion
        let paginationOptions = {
            page: this.state.page,
            sizePerPage: this.state.sizePerPage,
            totalSize: this.state.totalSize,
            sizePerPageList: [
                { text: '10', value: 10 },
                { text: '15', value: 15 },
                { text: '30', value: 30 }
            ],
            prePageText: 'Anterior',
            nextPageText: 'Siguiente'
        };

        return (
            <div>
                <div className="row">
                    <div className="col-9 button-col">
                        <h4>Acciones</h4>
                        <button type="button" className="btn btn-success" onClick={() => this.changeAction('add')}>Agregar</button>
                    </div>
                    <div className="col-3 button-col">
                        <div className="form-group">
                            <label htmlFor="search-user-input"><h5>Buscar</h5></label>
                            <input type="text"
                                className="form-control"
                                name="searchPhenotypeInput"
                                value={this.state.searchPhenotypeInput}
                                onChange={this.handleChange}
                                aria-describedby="searchHelpBlockAnalysis" />
                            <small id="searchHelpBlockAnalysis" className="form-text text-muted">
                                Buscará por descripción
                            </small>
                        </div>
                    </div>
                </div>

                <div id="admin-panel" className="row">
                    <div className="col-12">
                        <h4>Análisis</h4>
                        <BootstrapTable
                            remote={{ pagination: true, filter: true }}
                            keyField='id'
                            data={this.state.analysis}
                            columns={columns}
                            noDataIndication="No hay información para mostrar"
                            onTableChange={this.getAnalysis}
                            pagination={
                                paginationFactory(paginationOptions)
                            }
                            filter={filterFactory()}
                            loading={this.state.loading}
                            rowClasses="cursor-pointer"
                            overlay={
                                overlayFactory({
                                    spinner: true,
                                    background: 'rgba(192,192,192,0.3)'
                                })
                            } // Animacion mientras carga
                        />
                    </div>
                </div>

                {/* Modal de alta de analisis */}
                <AddAnalysisModal
                    modalId={this.addAnalysisModalId}
                    action={this.state.action}
                    selectedAnalysis={this.state.selectedAnalysis}
                    getAnalysis={this.getAnalysis}
                />

                {/* Modal de confirmacion de eliminacion de analisis */}
                <DeleteAnalysisModal
                    modalId={this.deleteAnalysisModalId}
                    analisysId={this.state.selectedAnalysis.id}
                    analysisDescription={this.state.selectedAnalysis.description}
                    getAnalysis={this.getAnalysis}
                />

                {/* Modal de confirmacion de publicacion */}
                <PublishAnalysisModal
                    modalId={this.publishAnalysisModalId}
                    analisysId={this.state.selectedAnalysis.id}
                    analysisDescription={this.state.selectedAnalysis.description}
                    getAnalysis={this.getAnalysis}
                />

            </div>
        );
    }
}