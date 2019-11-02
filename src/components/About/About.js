import React from 'react';
import ReactGA from 'react-ga';
import './About.css';


const About = ({className}) => {
        ReactGA.pageview('/about');
        return <p className="center">
                {'NGU Idle Gear Optimizer v' + process.env.REACT_APP_VERSION}
                <br/> {'Git hash: ' + process.env.REACT_APP_GIT_HASH}
                <br/>
                <a href="https://github.com/gmiclotte/gear-optimizer/issues/new" rel="noopener noreferrer" target="_blank">
                        Report an issue.
                </a>
                <br/>
                <br/> {'Not affiliated with '}
                <a href="https://www.kongregate.com/games/somethingggg/ngu-idle" rel="noopener noreferrer" target="_blank">
                        NGU Idle
                </a>{'.'}
                <br/>
                <br/> {'All art copyright by '}
                <a href="https://www.kongregate.com/accounts/somethingggg" rel="noopener noreferrer" target="_blank">
                        4G
                </a>{'.'}
        </p>;
};

export default About;
