
// TODO:
// travel days + dates
// travel country
// add weather forecast & temperatures
// official/casual
// print support
// cash exchange rate
// show standard prices - transit, milk, etc.
// +plane travel
// travel kind - picknick, plane, bicycle
// if plane -> timelines - arrival, departure from/to source&destination + durations, reservation number + other info
// place for stay/hotel info, contact, reservation numbers (+url?)
// requires passport?

const items = [
    { name: "Toothbrush", type: "hygiene", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Tooth paste", type: "hygiene", size: "small", weight: "light", handLuggage: "bottle", male: true, female: true },
    { name: "Shower gel", type: "hygiene", size: "small", weight: "medium", handLuggage: "bottle", male: true, female: true },
    { name: "Shampoo", type: "hygiene", size: "small", weight: "medium", handLuggage: "bottle", male: true, female: true },
    { name: "Conditioner", type: "hygiene", size: "small", weight: "medium", handLuggage: "bottle", male: true, female: true },
    { name: "Deodorant", type: "hygiene", size: "small", weight: "medium", handLuggage: "no", male: true, female: true },
    { name: "Hair styling gel", type: "hygiene", size: "small", weight: "small", handLuggage: "bottle", male: true, female: true },
    { name: "Towel", type: "hygiene", size: "big", weight: "medium", handLuggage: "yes", male: true, female: true },
    { name: "Shaver for beard", type: "hygiene", size: "medium", weight: "medium", handLuggage: "yes", male: true, female: false },
    { name: "Shaver for legs", type: "hygiene", size: "medium", weight: "medium", handLuggage: "yes", male: false, female: true },

    { name: "Contact lenses", type: "health", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Glasses", type: "health", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Earplugs", type: "health", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Painkillers", type: "health", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Wipes", type: "health", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Nailfile", type: "health", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Nail cutter", type: "health", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },

    { name: "Eye shadows", type: "makeup", size: "small", weight: "light", handLuggage: "yes", male: false, female: true },
    { name: "Undercoat", type: "makeup", size: "small", weight: "light", handLuggage: "yes", male: false, female: true },
    { name: "Make-up remover+wipes", type: "makeup", size: "small", weight: "light", handLuggage: "bottle", male: false, female: true },
    { name: "Blusher", type: "makeup", size: "small", weight: "light", handLuggage: "yes", male: false, female: true },

    { name: "Eye cream", type: "health", size: "small", weight: "light", handLuggage: "bottle", male: false, female: true },
    { name: "Face cream", type: "health", size: "small", weight: "light", handLuggage: "bottle", male: false, female: true },
    { name: "Hand cream", type: "health", size: "small", weight: "light", handLuggage: "bottle", male: false, female: true },

    { name: "Umbrella", type: "weather", size: "big", weight: "medium", handLuggage: "yes", male: true, female: true },
    { name: "Sunglasses", type: "weather", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Raincoat", type: "weather", size: "medium", weight: "medium", handLuggage: "yes", male: true, female: true },
    { name: "Gloves", type: "weather", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },

    { name: "Smartphone", type: "electronics", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Smartphone charger", type: "electronics", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Headphones", type: "electronics", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Laptop", type: "electronics", size: "large", weight: "heavy", handLuggage: "yes", male: true, female: true },
    { name: "Laptop charger", type: "electronics", size: "medium", weight: "heavy", handLuggage: "yes", male: true, female: true },
    { name: "Mouse", type: "electronics", size: "small", weight: "small", handLuggage: "yes", male: true, female: true },
    { name: "Powerbank", type: "electronics", size: "small", weight: "medium", handLuggage: "yes", male: true, female: true },
    { name: "Flashlight", type: "electronics", size: "small", weight: "medium", handLuggage: "yes", male: true, female: true },


    { name: "Backpack", type: "cloths", size: "large", weight: "heavy", handLuggage: "yes", male: true, female: true },

    { name: "T-shirt", type: "cloths", size: "medium", weight: "medium", handLuggage: "yes", male: true, female: true },
    { name: "Jeans", type: "cloths", size: "large", weight: "heavy", handLuggage: "yes", male: true, female: true },
    { name: "Underwear", type: "cloths", size: "medium", weight: "medium", handLuggage: "yes", male: true, female: true },
    { name: "Shoes", type: "cloths", size: "large", weight: "medium", handLuggage: "yes", male: true, female: true },
    { name: "Socks", type: "cloths", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Jacket", type: "cloths", size: "large", weight: "heavy", handLuggage: "yes", male: true, female: true },
    { name: "Cap", type: "cloths", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Scarf", type: "cloths", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Slippers", type: "cloths", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },

    { name: "Pyjamas", type: "cloths", size: "medium", weight: "medium", handLuggage: "yes", male: true, female: true },
    { name: "Bra", type: "cloths", size: "medium", weight: "medium", handLuggage: "yes", male: false, female: true },
    { name: "Blouse", type: "cloths", size: "large", weight: "heavy", handLuggage: "yes", male: true, female: true },


    { name: "Home keys", type: "important", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Wallet", type: "important", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
    { name: "Notes", type: "important", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },

    { name: "Swiss army knife", type: "other", size: "small", weight: "light", handLuggage: "no", male: true, female: true },
    { name: "Cash", type: "other", size: "small", weight: "light", handLuggage: "yes", male: true, female: true },
];

const actions = [
    { name: "Polish shoes", male: true, female: true },
    { name: "Exchange cash", male: true, female: true },
    { name: "Charge laptop battery", male: true, female: true },
    { name: "Charge smartphone battery", male: true, female: true },
    { name: "Turn on roaming", male: true, female: true },
    { name: "Buy data transfer packet", male: true, female: true },
    { name: "Downlaod Google Maps Offline", male: true, female: true },
    { name: "Empty the fridge", male: true, female: true },
    { name: "Empty the trash", male: true, female: true },
    { name: "Wash the dishes", male: true, female: true },
    { name: "Water flowers", male: true, female: true },
    { name: "Turn off gas", male: true, female: true },
    { name: "Turn off water", male: true, female: true },
    { name: "Turn off electricity", male: true, female: true },
    { name: "Buy snacks/food", male: true, female: true },
    { name: "Iron shirts", male: true, female: true },
    { name: "Check-in (online/airport)", male: true, female: true },
    { name: "Print check-in", male: true, female: true },
    { name: "Take ID card", male: true, female: true },
    { name: "Take passport", male: true, female: true },
];

window.onload = function() {

    const list = document.getElementById("list");

    items.map(item => {
        const div = document.createElement("DIV");
        const label = document.createElement("LABEL");
        label.textContent = item.name;
        div.append(label);

        list.append(div);
    });

    class Hello extends React.Component {
        render() {
            return React.createElement('div', null, `Hello ${this.props.toWhat}`);
        }
    }

    class Hello2 extends React.Component {
        render() {
            return React.createElement(Reactstrap.Button, null, `Hello ${this.props.toWhat}`);
        }
    };

    ReactDOM.render(
        React.createElement(Hello2, {toWhat: 'World'}, null),
        document.getElementById('root')
    );
};


