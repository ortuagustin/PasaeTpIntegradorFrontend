
import React from 'react';

// Componentes
import AnalysisCRUD from './AnalysisCRUD.jsx';


class ScientistPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="container-fluid panel-component">

                {/* Tabla de asociaciones Genotipo-Fenotipo */}
                <AnalysisCRUD/>
            </div>
        );
    }
}

export default ScientistPanel;