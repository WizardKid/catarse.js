import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import railsErrorsVM from '../vms/rails-errors-vm';
import projectDescriptionVideoVM from '../vms/project-description-video-vm';
import popNotification from './pop-notification';
import inputCard from './input-card';
import bigInputCard from './big-input-card';
import projectEditSaveBtn from './project-edit-save-btn';

const I18nScope = _.partial(h.i18nScope, 'projects.dashboard_description');
const I18nVideoScope = _.partial(h.i18nScope, 'projects.dashboard_video');

const projectDescriptionVideoEdit = {
    controller(args) {
        const vm = projectDescriptionVideoVM,
            mapErrors = [
                  ['about_html', ['about_html']],
                  ['video_url', ['video_url']]
            ],
            showSuccess = h.toggleProp(false, true),
            showError = h.toggleProp(false, true),
            loading = m.prop(false),
            onSubmit = (event) => {
                loading(true);
                m.redraw();
                vm.updateProject(args.projectId).then((data) => {
                    loading(false);
                    vm.e.resetFieldErrors();
                    if (!showSuccess()) { showSuccess.toggle(); }
                    if (showError()) { showError.toggle(); }
                    railsErrorsVM.validatePublish();
                }).catch((err) => {
                    if (err.errors_json) {
                        railsErrorsVM.mapRailsErrors(err.errors_json, mapErrors, vm.e);
                    }
                    loading(false);
                    if (showSuccess()) { showSuccess.toggle(); }
                    if (!showError()) { showError.toggle(); }
                });
                return false;
            };

        if (railsErrorsVM.railsErrors()) {
            railsErrorsVM.mapRailsErrors(railsErrorsVM.railsErrors(), mapErrors, vm.e);
        }
        vm.fillFields(args.project);

        return {
            onSubmit,
            showSuccess,
            showError,
            vm,
            loading
        };
    },
    view(ctrl, args) {
        const vm = ctrl.vm;
        return m('#description-tab', [
            (ctrl.showSuccess() ? m.component(popNotification, {
                message: window.I18n.t('shared.successful_update'),
                toggleOpt: ctrl.showSuccess
            }) : ''),
            (ctrl.showError() ? m.component(popNotification, {
                message: window.I18n.t('shared.failed_update'),
                toggleOpt: ctrl.showError,
                error: true
            }) : ''),

            m('form.w-form', { onsubmit: ctrl.onSubmit }, [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-10.w-col-push-1', [
                            m('.u-marginbottom-60.u-text-center', [
		                            m('.w-col-8.w-inline-block.card.fontsize-small.u-radius', [
                                m.trust(window.I18n.t('description_video_alert', I18nScope()))
		                            ])
	                          ]),
                            m(inputCard, {
                                label: window.I18n.t('video_label', I18nVideoScope()),
                                label_hint: window.I18n.t('video_hint', I18nVideoScope()),
                                children: [
                                    m('input.string.required.w-input.text-field.positive.medium[type="text"]', {
                                        value: vm.fields.video_url(),
                                        class: vm.e.hasError('video_url') ? 'error' : '',
                                        onchange: m.withAttr('value', vm.fields.video_url)
                                    }),
                                    vm.e.inlineError('video_url')
                                ]
                            })
                        ])
                    ]),
                    m('.w-row', [
                        m('.w-col.w-col-10.w-col-push-1', [
                            m(bigInputCard, {
                                label: window.I18n.t('description_label', I18nScope()),
                                label_hint: window.I18n.t('description_hint', I18nScope()),
                                children: [
                                    m('.preview-container', {
                                        class: vm.e.hasError('about_html') ? 'error' : false
                                    }, h.redactor('project[about_html]', vm.fields.about_html)),
                                    vm.e.inlineError('about_html')
                                ]
                            })
                        ])
                    ])
                ]),
                m(projectEditSaveBtn, { loading: ctrl.loading, onSubmit: ctrl.onSubmit })
            ])

        ]);
    }
};

export default projectDescriptionVideoEdit;
