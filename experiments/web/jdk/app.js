const JDK_VERSION_GA = {
    "7": "2011-07-28",
    "8": "2014-03-18",
    "9": "2017-09-21",
    "10": "2018-03-20",
    "11": "2018-09-25",
    "12": "2019-03-19"
};

const getJdkFeaturesUrl = (version) => {
    if (version == 8) {
        return `https://openjdk.java.net/projects/jdk${version}/features`;
    } else if (version == 9) {
        return `https://openjdk.java.net/projects/jdk${version}`;
    }
    return `https://openjdk.java.net/projects/jdk/${version}/`;
};

class JepFeature extends React.Component {
    render() {
        return React.createElement('div', { className: 'feature' }, [
            React.createElement('a', {
                href: `https://openjdk.java.net/jeps/${this.props.number}`,
                className: 'jep',
                target: '_blank',
                rel: 'noreferrer'
            }, `JEP ${this.props.number}`),
            ': ',
            React.createElement('span', {className: 'jep-name'}, this.props.title),
            React.createElement('div', {className: 'summary'}, this.props.summary)
        ]);
    }
}


class JdkVersion extends React.Component {
    render() {
        let features = this.props.features.map(jep => React.createElement(JepFeature, jep, null));
        return React.createElement('section', null, [
            React.createElement('h2', null, [
                React.createElement('a', {
                    href: getJdkFeaturesUrl(this.props.version),
                    target: '_blank',
                    rel: 'noreferrer'
                }, `JDK ${this.props.version}`)
            ]),
            React.createElement('div', { className: 'release-meta' }, [
                `GA: ${JDK_VERSION_GA[this.props.version]}`,
                ' ',
                React.createElement('small', {className: 'timeago'}, '(' + moment(JDK_VERSION_GA[this.props.version]).fromNow() + ')')
            ])
        ].concat(features));
    }
}

class JdkApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        fetch('./data/jdk-data.json')
            .then(response => response.json())
            .then(data => {
                this.setState(data)
            });
    }

    render() {
        let versions = Object.entries(this.state).map(pair => React.createElement(JdkVersion, {
            version: pair[0],
            features: pair[1]
        }, null));

        return React.createElement('div', {className: 'jdk-version'}, versions);
    }
}


window.onload = function () {
    ReactDOM.render(
        React.createElement(JdkApp, null, null),
        document.getElementById('react-root')
    );
};


