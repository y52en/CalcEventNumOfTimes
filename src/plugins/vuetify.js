import Vue from 'vue';
import Vuetify from 'vuetify/lib';


Vue.use(Vuetify);

export default new Vuetify({
    modules: {
        
    },
        theme: {
            dark: false,
            themes: {
                light: {
                    background: "#fcfcfc",
                },
                dark: {
                    background: "#303030",
                },
            },
        },

});





