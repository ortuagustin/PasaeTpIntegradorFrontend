import React from 'react';

// Componentes
import AddPatientModal from './AddPatientModal.jsx';
import DeletePatientModal from './DeletePatientModal.jsx';

// Librerias
import BootstrapTable from 'react-bootstrap-table-next'; // Tabla
import paginationFactory from 'react-bootstrap-table2-paginator'; // Paginacion en tabla
import overlayFactory from 'react-bootstrap-table2-overlay'; // Para la animacion de carga
import filterFactory from 'react-bootstrap-table2-filter';

// Funciones
import { actionModal } from '../functions_util';

// Iconos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons'

/**
 * Componente que renderiza el panel de CRUD de usuarios
 */
class PatientsCRUDComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            patients: [],
            page: 1,
            sizePerPage: 10,
            totalSize: 0,
            selectedPatient: {},
            action: null,
            searchPatientInput: '',
        }

        // Variables que no renderizan la vista
        this.addPatientModalId = 'add-pathology-modal';
        this.deletePatientModalId = 'delete-pathology-modal';

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.getPatients = this.getPatients.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    /**
     * Metodo que se ejecuta cuando termina de
     * renderizar el componente
     */
    componentDidMount() {
        this.getPatients();
    }

    /**
     * Obtiene los fenotipos via AJAX.
     * Para mas info acerca de los parametros: https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/table-props.html#ontablechange-function
     * @param {string} type Tipo de accion realizada en la tabla
     * @param {*} newState Atributos de la tabla actuales
     */
    getPatients(actionType = '', newState = {}) {
        let self = this;

        // Genero los parametros del request
        let pageNumber = newState.page ? newState.page : self.state.page;
        let sizePerPage = newState.sizePerPage ? newState.sizePerPage : self.state.sizePerPage;

        // Cargo los pacientes
        self.setState({ loading: true }, () => {
            $.ajax({
                url: 'https://pasae-backend.herokuapp.com/patients/',
                data: {
                    newestPage: pageNumber - 1,
                    newestSizePerPage: sizePerPage,
                    newestSortField: newState.sortField,
                    newestSortOrder: newState.sortOrder,
                    search: self.state.searchPatientInput
                }
            }).done(function (jsonReponse, textStatus, jqXHR) {
                if (jqXHR.status == 200) {
                    self.setState({
                        patients: jsonReponse.content,
                        page: pageNumber,
                        sizePerPage: sizePerPage,
                        totalSize: jsonReponse.totalElements
                    });
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR, textStatus, errorThrown);
            }).always(function() {
                self.setState({  loading: false });
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
            actionModal(this.addPatientModalId, 'show');
        });
    }

    /**
     * Metodo que se ejecuta cuando los inputs cambian.
     * Sirve para refrescar el state
     * @param {Event} e Evento del cambio del input
     */
    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value }, () => {
            this.getPatients();
        });;
    }

    /**
     * Selecciona el paciente actual y ejecuta una accion
     * @param {*} patient Paciente a seleccionar
     * @param {*} action Editar | Eliminar el paciente seleccionado
     */
    selectAndAction(patient, action) {
        this.setState({ selectedPatient: patient }, () => {
            if (action == 'edit') {
                this.changeAction('edit')
            } else {
                actionModal(this.deletePatientModalId, 'show');
            }
        });
    }

    render() {
        const columns = [
            {
                dataField: 'name',
                text: 'Nombre',
                sort: true,
            },
            {
                dataField: 'surname',
                text: 'Apellido',
                sort: true,
            },
            {
                dataField: 'dni',
                text: 'DNI',
                sort: true,
            },
            {
                dataField: 'email',
                text: 'Mail',
                sort: true,
            },
            {
                dataField: 'numericPhenotypes',
                text: 'Fenotipos numéricos',
                formatter: (cell, row) => {
                    return row.numericPhenotypes ? row.numericPhenotypes.map((numericPhenotype) => {
                        return numericPhenotype.phenotype.name;
                    }).join(", ") : '-';
                }
            },
            {
                dataField: 'categoricPhenotypes',
                text: 'Fenotipos categóricos',
                formatter: (cell, row) => {
                    return row.categoricPhenotypes ? row.categoricPhenotypes.map((numericPhenotype) => {
                        return numericPhenotype.phenotype.name;
                    }).join(", ") : '-';
                }
            },
            {
                dataField: 'noField',
                text: 'Acciones',
                formatter: (cell, row) => {
                    return (
                        <div>
                            <span className="animated-ease-1seg yellow-hover" title="Editar" onClick={() => this.selectAndAction(row, 'edit')}>
                                <FontAwesomeIcon icon={faEdit} />
                            </span>
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
                                name="searchPatientInput"
                                value={this.state.searchPatientInput}
                                onChange={this.handleChange}
                                aria-describedby="searchHelpBlockPathology" />
                            <small id="searchHelpBlockPathology" className="form-text text-muted">
                                Buscará por nombre, apellido, dni y mail
                            </small>
                        </div>
                    </div>
                </div>

                <div id="admin-panel" className="row">
                    <div className="col-12">
                        <h4>Pacientes</h4>
                        <BootstrapTable
                            remote={{ pagination: true, filter: true }}
                            keyField='id'
                            data={this.state.patients}
                            columns={columns}
                            page={this.state.page}
                            sizePerPage={this.state.sizePerPage}
                            totalSize={this.state.totalSize}
                            noDataIndication="No hay información para mostrar"
                            onTableChange={this.getPatients}
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

                {/* Modal de alta de paciente */}
                <AddPatientModal
                    modalId={this.addPatientModalId}
                    action={this.state.action}
                    selectedPatient={this.state.selectedPatient}
                    getPatients={this.getPatients}
                    currentUserId={this.props.currentUserId}
                />

                {/* Modal de confirmacion de eliminacion de paciente */}
                <DeletePatientModal
                    modalId={this.deletePatientModalId}
                    patientId={this.state.selectedPatient.id}
                    name={this.state.selectedPatient.name}
                    getPatients={this.getPatients}
                />
            </div>
        );
    }
}

export default PatientsCRUDComponent;