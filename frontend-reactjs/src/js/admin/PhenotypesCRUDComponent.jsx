import React from 'react';

// Componentes
import AddPhenotypeModal from './AddPhenotypeModal.jsx';
import DeletePhenotypeModal from './DeletePhenotypeModal.jsx';

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
class PhenotypesCRUDComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            phenotypes: [],
            page: 1,
            sizePerPage: 10,
            totalSize: 0,
            selectedPhenotype: {},
            action: null,
            searchPhenotypeInput: '',
            phenotypesType: 'numeric'
        }

        // Variables que no renderizan la vista
        this.addPhenotypeModalId = 'add-user-modal';
        this.deletePhenotypeModalId = 'delete-user-modal';

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.getPhenotypes = this.getPhenotypes.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    /**
     * Metodo que se ejecuta cuando termina de
     * renderizar el componente
     */
    componentDidMount() {
        this.getPhenotypes();
    }

    /**
     * Obtiene los fenotipos via AJAX.
     * Para mas info acerca de los parametros: https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/table-props.html#ontablechange-function
     * @param {string} type Tipo de accion realizada en la tabla
     * @param {*} newState Atributos de la tabla actuales
     */
    getPhenotypes(actionType = '', newState = {}) {
        let self = this;

        // Genero los parametros del request
        let pageNumber = newState.page ? newState.page : self.state.page;
        let sizePerPage = newState.sizePerPage ? newState.sizePerPage : self.state.sizePerPage;

        let url = self.state.phenotypesType == 'numeric' ? 'https://pasae-backend.herokuapp.com/numeric-phenotypes/' : 'https://pasae-backend.herokuapp.com/categoric-phenotypes/';

        // Cargo los fenotipos numericos y categoricos
        self.setState({ loading: true }, () => {
            $.ajax({
                url: url,
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
                        phenotypes: jsonReponse.content,
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
            actionModal(this.addPhenotypeModalId, 'show');
        });
    }

    /**
     * Metodo que se ejecuta cuando los inputs cambian.
     * Sirve para refrescar el state
     * @param {Event} e Evento del cambio del input
     */
    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value }, () => {
            this.getPhenotypes();
        });;
    }

    /**
     * Cambia el tipo de fenotipo a listar
     * @param {string} type Tipo actual de fenotypos a listar
     */
    changePhenotypesType(type) {
        this.setState({ phenotypesType: type }, () => {
            // Cuando termina de setearlo vuelve a pedir los fenotipos
            this.getPhenotypes();
        })
    }

    /**
     * Selecciona el fenotipo actual y ejecuta una accion
     * @param {*} phenotype Fenotipo a seleccionar
     * @param {*} action Editar | Eliminar el fenotipo seleccionado
     */
    selectAndAction(phenotype, action) {
        this.setState({ selectedPhenotype: phenotype }, () => {
            if (action == 'edit') {
                this.changeAction('edit')
            } else {
                actionModal(this.deletePhenotypeModalId, 'show');
            }
        });
    }

    render() {
        const columns = [
            {
                dataField: 'name',
                text: 'Nombre',
                sort: true,
            }, {
                dataField: 'type',
                text: 'Tipo',
                formatter: (cell, row) => {
                    return row.values ? "Categórico" : 'Numérico';
                },
            }, {
                dataField: 'values',
                text: 'Valor/es',
                formatter: (cell, row) => {
                    return row.values ? row.values.map((value) => value.value).join(", ") : '-';
                }
            }, {
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
                                name="searchPhenotypeInput"
                                value={this.state.searchPhenotypeInput}
                                onChange={this.handleChange}
                                aria-describedby="searchHelpBlockPhenotypes" />
                            <small id="searchHelpBlockPhenotypes" className="form-text text-muted">
                                Buscará por nombre
                            </small>
                        </div>
                    </div>
                </div>

                <div className="row margin-bottom">
                    <div className="col-12">
                        <ul className="nav nav-pills">
                            <li className="nav-item">
                                <a className={"nav-link " + (this.state.phenotypesType == "numeric" ? 'active' : '')} onClick={() => this.changePhenotypesType('numeric')} href="#">Numéricos</a>
                            </li>
                            <li className="nav-item">
                                <a className={"nav-link " + (this.state.phenotypesType == "categoric" ? 'active' : '')} onClick={() => this.changePhenotypesType('categoric')} href="#">Categóricos</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div id="admin-panel" className="row">
                    <div className="col-12">
                        <h4>Fenotipos</h4>
                        <BootstrapTable
                            remote={{ pagination: true, filter: true }}
                            keyField='id'
                            data={this.state.phenotypes}
                            columns={columns}
                            noDataIndication="No hay información para mostrar"
                            onTableChange={this.getPhenotypes}
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

                {/* Modal de alta de fenotipo */}
                <AddPhenotypeModal
                    modalId={this.addPhenotypeModalId}
                    action={this.state.action}
                    selectedPhenotype={this.state.selectedPhenotype}
                    phenotypeType={this.state.phenotypesType}
                    getPhenotypes={this.getPhenotypes}
                />

                {/* Modal de confirmacion de eliminacion de fenotipo */}
                <DeletePhenotypeModal
                    modalId={this.deletePhenotypeModalId}
                    phenotypeId={this.state.selectedPhenotype.id}
                    name={this.state.selectedPhenotype.name}
                    phenotypeType={this.state.phenotypesType}
                    getPhenotypes={this.getPhenotypes}
                />
            </div>
        );
    }
}

export default PhenotypesCRUDComponent;