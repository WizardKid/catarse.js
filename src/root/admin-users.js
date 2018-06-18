//@TODO: Start elm app
import m from 'mithril';
import Elm from './admin-users.elm';

const adminUsers = {
    controller() {
        const startApp = (el, isInitialized) => {
            if (!isInitialized){
                console.log('will start in el:', el.id);
                Elm.Main.embed(el);
            }
        };

        return {
            startApp
        };
    },
    view(ctrl) {
        return m('#admin-users', {config: ctrl.startApp});
    }
};

export default adminUsers;
