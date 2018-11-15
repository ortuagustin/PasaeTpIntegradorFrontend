
import React from 'react';

// Componentes
import AnalysisPublishedCRUD from './AnalysisPublishedCRUD.jsx';

class ClinicalDoctorPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="container-fluid panel-component">

                {/* Tabla de analisis publicados */}
                <AnalysisPublishedCRUD/>
            </div>
        );
    }
}

export default ClinicalDoctorPanel;