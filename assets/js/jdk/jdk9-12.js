const Button = Reactstrap.Button;
const ButtonGroup = Reactstrap.ButtonGroup;

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


// TODO: juffalow.com/ checkout the style of tags & aboutme
// TODO books read/recommended

class JepFeature extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        let attrs = {
            className: 'feature'
        };

        return React.createElement('div', attrs, [
            React.createElement('a', {
                href: `https://openjdk.java.net/jeps/${this.props.number}`,
                className: 'jep'
            }, `JEP ${this.props.number}`),
            ': ',
            React.createElement('span', {className: 'jep-name'}, this.props.title),
            React.createElement('div', {className: 'summary'}, this.props.summary)
        ]);
    }
}


class JdkComponentSelector extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selected: {},
            names: ["core-libs", "security-libs"]
        };

        this.onToggle = this.onToggle.bind(this);
    }

    render() {
        const size = "sm";
        const toggles = this.state.names.map(name => {
            const props = {
                size: size,
                active: !!this.state.selected[name],
                onClick: () => this.onToggle(name)
            };
            return React.createElement(Button, props, name);
        });

        return (
            React.createElement(ButtonGroup, null, toggles)
        );
    }

    onToggle(name) {
        this.setState({
            selected: {...this.state.selected, [name]: !this.state.selected[name]}
        });

    }

    componentDidUpdate(prevProps, prevState) {
        console.log("new state", this.state);
    }


}


class JdkVersion extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let features = this.props.features.map(jep => React.createElement(JepFeature, jep, null));
        return React.createElement('section', null, [
            React.createElement('h2', null, [
                React.createElement('a', {
                    href: getJdkFeaturesUrl(this.props.version),
                    target: '_blank'
                }, `JDK ${this.props.version}`)
            ]),
            React.createElement('div', null, [
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
        fetch('/assets/js/jdk/jdk-data.json')
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


