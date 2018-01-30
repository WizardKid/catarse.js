import m from 'mithril';
import moment from 'moment';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import projectDashboardMenu from '../c/project-dashboard-menu';
import projectInviteCard from '../c/project-invite-card';
import projectGoalsBoxDashboard from './project-goals-box-dashboard';
import insightsInfoBox from './insights-info-box';
import projectGoalsVM from '../vms/project-goals-vm';
import subscriptionVM from '../vms/subscription-vm';
import userVM from '../vms/user-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.insights');

const projectInsightsSub = {
    controller(args) {
        const filtersVM = args.filtersVM;
        const weekSubscriptions = m.prop({});
        const lastWeekSubscriptions = m.prop({});
        const weekTransitions = m.prop({});
        const lastWeekTransitions = m.prop({});

        subscriptionVM.getNewSubscriptions(args.project.common_id, moment().utc().subtract(1, 'weeks').format(), moment().utc().format())
            .then(weekSubscriptions);
        subscriptionVM.getNewSubscriptions(args.project.common_id, moment().utc().subtract(2, 'weeks').format(), moment().utc().subtract(1, 'weeks').format())
            .then(lastWeekSubscriptions);

        subscriptionVM.getSubscriptionTransitions(args.project.common_id, ['inactive', 'canceled'], 'active', moment().utc().subtract(1, 'weeks').format(), moment().utc().format())
            .then(weekTransitions);
        subscriptionVM.getSubscriptionTransitions(args.project.common_id, ['inactive', 'canceled'], 'active', moment().utc().subtract(2, 'weeks').format(), moment().utc().subtract(1, 'weeks').format())
            .then(lastWeekTransitions);

        projectGoalsVM.fetchGoals(filtersVM.project_id());
        const balanceLoader = userVM.getUserBalance(args.project.user_id);

        return {
            weekSubscriptions,
            lastWeekSubscriptions,
            weekTransitions,
            lastWeekTransitions,
            projectGoalsVM,
            balanceLoader
        };
    },
    view(ctrl, args) {
        const sumAmount = list => _.reduce(list, (memo, sub) => memo + (sub.amount / 100), 0);
        const sumTransitionAmount = list => _.reduce(list, (memo, sub) => memo + (sub.data.checkout_data.amount / 100), 0);
        const weekSum = sumAmount(ctrl.weekSubscriptions());
        const lastWeekSum = sumAmount(ctrl.lastWeekSubscriptions());
        const canceledWeekSum = sumTransitionAmount(ctrl.weekTransitions());
        const canceledLastWeekSum = sumTransitionAmount(ctrl.lastWeekTransitions());
        const project = args.project,
            subscribersDetails = args.subscribersDetails,
            balanceData = (ctrl.balanceLoader() && !_.isNull(_.first(ctrl.balanceLoader())) ? _.first(ctrl.balanceLoader()) : null);
        const averageRevenue = subscribersDetails.total_subscriptions > 0 ? (subscribersDetails.amount_paid_for_valid_period / subscribersDetails.total_subscriptions) : '--';

        return m('.project-insights', !args.l() ? [
            m(`.w-section.section-product.${project.mode}`),
            (project.is_owner_or_admin ? m.component(projectDashboardMenu, {
                project: m.prop(project)
            }) : ''),
            m('.dashboard-header.section-one-column', [
                m('.u-marginbottom-30.u-text-center', [
                    m('.fontsize-larger.fontweight-semibold',
                        `Olá, ${project.user.public_name || project.user.name}!`
                    ),
                    m('.fontsize-smaller',
                        `Este é o retrato de sua campanha hoje, ${moment().format('DD [de] MMMM [de] YYYY')}`
                    )
                ]),
                m('.w-container', [
                    m('.flex-row.u-marginbottom-40.u-text-center-small-only', [
                        subscribersDetails && !_.isEmpty(ctrl.projectGoalsVM.goals()) ?
                        m.component(projectGoalsBoxDashboard, {
                            goalDetails: ctrl.projectGoalsVM.goals,
                            amount: subscribersDetails.amount_paid_for_valid_period
                        }) : '',
                        m('.card.card-terciary.flex-column.u-marginbottom-10.u-radius', [
                            m('.fontsize-small.u-marginbottom-10',
                                'Assinantes ativos'
                            ),
                            m('.fontsize-largest.fontweight-semibold',
                                subscribersDetails.total_subscriptions
                            )
                        ]),
                        m('.card.card-terciary.flex-column.u-marginbottom-10.u-radius', [
                            m('.fontsize-small.u-marginbottom-10',
                                'Receita Mensal'
                            ),
                            m('.fontsize-largest.fontweight-semibold',
                                `R$${h.formatNumber(subscribersDetails.amount_paid_for_valid_period, 2, 3)}`
                            )
                        ]),
                        m('.card.flex-column.u-marginbottom-10.u-radius', [
                            m('.fontsize-small.u-marginbottom-10', [
                                'Saldo',
                                m.trust('&nbsp;'),
                                ' ',
                                m(`a.btn-inline.btn-terciary.fontsize-smallest.u-radius[href='/users/${project.user_id}/edit#balance']`,
                                    'Sacar'
                                )
                            ]),
                            m('.fontsize-largest.fontweight-semibold.text-success.u-marginbottom-10',
                                (balanceData && balanceData.amount ? `R$${h.formatNumber(balanceData.amount, 2, 3)}` : '')
                            ),
                            m('.fontsize-mini.fontcolor-secondary.lineheight-tighter',
                                'O saldo demora até 20 mins após o pagamento para ser atualizado.'
                            )
                        ])
                    ]),
                    (project.state === 'online' && !project.has_cancelation_request ? m('.w-container', m.component(projectInviteCard, {
                        project
                    })) : ''),

                    m('.u-marginbottom-60', [
                        m(".fontsize-large.fontweight-semibold.u-text-center.u-marginbottom-30[id='origem']",
                            'Assinaturas'
                        ),
                        m('.flex-row.u-marginbottom-40.u-text-center-small-only', [
                            m(insightsInfoBox, {
                                label: 'Novos Assinantes',
                                info: ctrl.weekSubscriptions().length,
                                newCount: ctrl.weekSubscriptions().length,
                                oldCount: ctrl.lastWeekSubscriptions().length
                            }),
                            m(insightsInfoBox, {
                                label: 'Assinantes perdidos',
                                info: ctrl.weekTransitions().length,
                                newCount: ctrl.weekTransitions().length,
                                oldCount: ctrl.lastWeekTransitions().lenght
                            })
                        ])
                    ]),
                    m('.u-marginbottom-60', [
                        m('.fontsize-large.fontweight-semibold.u-text-center.u-marginbottom-30',
                            'Receita'
                        ),
                        m('.flex-row.u-marginbottom-40.u-text-center-small-only', [
                            m('.flex-column.card.u-radius.u-marginbottom-10', [
                                m('div',
                                    'Receita média por assinante'
                                ),
                                m('.fontsize-smallest.fontcolor-secondary.lineheight-tighter',
                                    `em ${moment().format('DD/MM/YYYY')}`
                                ),
                                m('.fontsize-largest.fontweight-semibold',
                                  `R$${h.formatNumber( averageRevenue, 2, 3 )}`
                                 )

                            ]),
                            m(insightsInfoBox, {
                                label: 'Nova receita',
                                info: `R$${weekSum}`,
                                newCount: weekSum,
                                oldCount: lastWeekSum
                            }),
                            m(insightsInfoBox, {
                                label: 'Receita perdida',
                                info: `R$${canceledWeekSum}`,
                                newCount: canceledWeekSum,
                                oldCount: canceledLastWeekSum
                            })
                        ])
                    ])
                ])
            ])
        ] : h.loader());
    }
};

export default projectInsightsSub;
