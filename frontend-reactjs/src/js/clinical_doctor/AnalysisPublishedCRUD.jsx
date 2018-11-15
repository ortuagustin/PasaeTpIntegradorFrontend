import React from 'react';

// Componentes
import PredictionAnalysisModal from './PredictionAnalysisModal.jsx';

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
import { faCloud } from '@fortawesome/free-solid-svg-icons'

/**
 * Componente que renderiza el panel de CRUD de analisis
 */
export default class AnalysisPublishedCRUD extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            analysis: [],
            page: 1,
            sizePerPage: 10,
            totalSize: 0,
            selectedAnalysis: {},
            action: null,
            searchAnalysisInput: '',
        }

        // Variables que no renderizan la vista
        this.predictModalId = 'modal-prediction';

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.getPublishedAnalysis = this.getPublishedAnalysis.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.changeSnpsValue = this.changeSnpsValue.bind(this);
    }

    /**
     * Metodo que se ejecuta cuando termina de
     * renderizar el componente
     */
    componentDidMount() {
        this.getPublishedAnalysis();
    }

    /**
     * Cambia el valor para el snp seleccionado
     * @param {Event} e Evento de cambio del input
     */
    changeSnpsValue(e, idx) {
        // Verifico que el formulario sea valido
        if (!e.target.validity.valid) {
            return;
        }

        let selectedAnalysis = this.state.selectedAnalysis;
        selectedAnalysis.snps[idx].value = e.target.value.toUpperCase();
        this.setState({ selectedAnalysis });
    }

    /**
     * Obtiene los fenotipos via AJAX.
     * Para mas info acerca de los parametros: https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/table-props.html#ontablechange-function
     * @param {string} type Tipo de accion realizada en la tabla
     * @param {*} newState Atributos de la tabla actuales
     */
    getPublishedAnalysis(actionType = '', newState = {}) {
        let self = this;

        // Genero los parametros del request
        let pageNumber = newState.page ? newState.page : self.state.page;
        let sizePerPage = newState.sizePerPage ? newState.sizePerPage : self.state.sizePerPage;

        // Cargo los fenotipos numericos y categoricos
        self.setState({ loading: true }, () => {
            $.ajax({
                url: 'https://pasae-backend.herokuapp.com/analysis/published',
                data: {
                    newestPage: pageNumber - 1,
                    newestSizePerPage: sizePerPage,
                    newestSortField: newState.sortField,
                    newestSortOrder: newState.sortOrder,
                    search: self.state.searchAnalysisInput
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
     * Metodo que se ejecuta cuando los inputs cambian.
     * Sirve para refrescar el state
     * @param {Event} e Evento del cambio del input
     */
    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value }, () => {
            this.getPublishedAnalysis();
        });;
    }

    /**
     * Genera una prediccion a partir de un analisis especificado
     * @param {*} analysis Analisis para generar el reporte
     */
    predictWithAnalysis(analysis) {
        this.setState({ selectedAnalysis: analysis}, () => {
            actionModal(this.predictModalId, 'show');
        });
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
                formatter: (cell, analysis) => moment(analysis.date).format('DD/MM/YYYY HH:mm:ss')
            }, {
                dataField: 'noField',
                text: 'Acciones',
                formatter: (cell, analysis) => {
                    return (
                        <div>
                            <span className="animated-ease-1seg green-hover"
                                title="Predecir"
                                onClick={() => this.predictWithAnalysis(analysis)}>
                                <FontAwesomeIcon icon={faCloud} />
                            </span>
                        </div>
                    );
                }
            }
        ];

        // Seteos de paginacion
        const paginationOptions = {
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

        // Eventos de interaccion con las filas
        const eventsOnRow = {
            onDoubleClick: (e, analysis) => {
                this.predictWithAnalysis(analysis);
            }
        };

        return (
            <div>
                <div className="row">
                    <div className="col-9 button-col">
                        <h4>Acciones</h4>
                        <h5><strong>No hay acciones disponibles</strong></h5>
                    </div>
                    <div className="col-3 button-col">
                        <div className="form-group">
                            <label htmlFor="search-user-input"><h5>Buscar</h5></label>
                            <input type="text"
                                className="form-control"
                                name="searchAnalysisInput"
                                value={this.state.searchAnalysisInput}
                                onChange={this.handleChange}
                                aria-describedby="searchHelpBlockAnalysis" />
                            <small id="searchHelpBlockAnalysis" className="form-text text-muted">
                                Buscará por descripción
                            </small>
                        </div>
                    </div>
                </div>

                <div id="analysis-published-crud" className="row">
                    <div className="col-12">
                        <h4>Análisis publicados</h4>
                        <BootstrapTable
                            remote={{ pagination: true, filter: true }}
                            keyField='id'
                            data={this.state.analysis}
                            columns={columns}
                            rowEvents={eventsOnRow}
                            noDataIndication="No hay información para mostrar"
                            onTableChange={this.getPublishedAnalysis}
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

                {/* Modal de prediccion */}
                <PredictionAnalysisModal
                    modalId={this.predictModalId}
                    analysisId={this.state.selectedAnalysis.id}
                    snps={this.state.selectedAnalysis.snps}
                    changeSnpsValue={this.changeSnpsValue}
                />
            </div>
        );
    }
}