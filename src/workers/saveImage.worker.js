// SEK SOK TODO
//import domtoimage from "dom-to-image"
import $ from "jquery"
export default () => {
    self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
        if (!e) return;
        let dom = e.data[0];
        console.log('domtoimage',dom,e)

        console.log($);
        

        postMessage("asd");
    })
}