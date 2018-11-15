import React from 'react';

// Componentes React
import PatientsCRUDComponent from './PatientsCRUDComponent.jsx';

// Estilos
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'; // Estilos de la tabla

class RegisterPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="container-fluid panel-component">
                <PatientsCRUDComponent
                    currentUserId={this.props.currentUserId}
                />
            </div>
        );
    }
}

export default RegisterPanel;