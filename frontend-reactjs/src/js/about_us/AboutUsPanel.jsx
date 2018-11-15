
import React from 'react';

// Imagenes
import imgGena from '../../img/gena.png';
import imgAgus from '../../img/agus.png';

class AboutUsPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="container-fluid panel-component">
                <h1>Acerca de nosotros</h1>
                <div className="row">
                    <div className="col-3">
                        <img src={imgAgus} alt="Imagen Agus" />
                    </div>
                    <div className="col-9">
                        <h2>
                            <strong>Agustín Ortu</strong>
                        </h2>
                        <h3>
                            Estudiante de informática, le gusta programar en Visual Basic porque dice que es robusto. 4 veces campeón de rap bajo el agua.
                        </h3>
                    </div>
                </div>

                <div className="row margin-top">
                    <div className="col-3">
                        <img src={imgGena} alt="Imagen Gena"/>
                    </div>
                    <div className="col-9">
                        <h2>
                            <strong>Genaro Camele</strong>
                        </h2>
                        <h3>
                           Autor del libro "Cómo vencer la resaca con jabón blanco, 1 litro de nafta y 3 fósforos". Actualmente se enfoca en su nuevo trabajo "Cómo levantar Spring en menos de 8 meses".
                        </h3>
                    </div>
                </div>
            </div>
        );
    }
}

export default AboutUsPanel;