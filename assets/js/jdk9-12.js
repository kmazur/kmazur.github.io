//
// const getFeatureTags = (elem) => elem.dataset.tags.split(' ').map(t => t.toLowerCase())
//
// const getButtonGroup = () => document.getElementById("filter");
// const getAllFeatures = () => [...document.querySelectorAll(".feature")];
// const getAllTags     = () => Array.from(new Set(getAllFeatures()
//     .map(f => getFeatureTags(f))
//     .reduce((x,y) => x.concat(y), [])))
//     .filter(tag => tag.trim().length > 0);
// const getActiveTags  = () => [...getButtonGroup().children]
//     .filter(c => c.dataset.active == "true")
//     .map(c => c.textContent);
//
//
// function createTagButton(tag) {
//     let elem = document.createElement("button");
//     elem.className = "btn btn-secondary";
//     elem.textContent = tag.toLowerCase();
//     elem.dataset.active = false;
//     elem.onclick = function(e) {
//         let flag = elem.dataset.active == "true";
//         elem.dataset.active = !flag;
//         filterFeatures();
//     };
//     return elem;
// }
//
// function filterFeatures() {
//     let activeTags = getActiveTags();
//     if(activeTags.length === 0) {
//         activeTags = getAllTags();
//     }
//     let featureElems = getAllFeatures();
//     featureElems.forEach(elem => {
//         let tags = getFeatureTags(elem);
//         let matchedTags = tags.filter(tag => activeTags.includes(tag));
//         elem.style.display = matchedTags.length > 0 ? "block" : "none";
//     });
// }
//
// window.onload = function() {
//     let tags = getAllTags();
//     let btnGroup = getButtonGroup();
//
//     tags.map(tag => createTagButton(tag)).forEach(button => btnGroup.append(button));
//
//     [...document.querySelectorAll(".timeago")].forEach(e => {
//         e.textContent = "(" + moment(e.getAttribute("datetime")).fromNow() + ")";
//     });
// };

const Button = Reactstrap.Button;
const ButtonGroup = Reactstrap.ButtonGroup;

// TODO: juffalow.com/ checkout the style of tags & aboutme

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

window.onload = function () {
    ReactDOM.render(
        React.createElement(JdkComponentSelector, null, null),
        document.getElementById('react-root')
    );
};


