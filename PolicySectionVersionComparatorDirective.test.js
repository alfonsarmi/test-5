loadJsFile(
  `${__dirname}/../common/DefaultDateFilter.js`,
  'var dateFormatGeneral="???";angular.module("app").filter("defaultDate", DefaultDateFilter);'
);
loadJsFile(`${__dirname}/PolicySectionVersionComparatorDirective.js`);

describe('Policy.PolicySectionVersionComparatorDirective directive', () => {
    let $rootScope;
    let $scope;
    let $compile;
    let quoteComparatorServiceMock;

    function setupScopeProperties(rootScope) {
        return Object.assign(rootScope, {
            linkFloatRight: false,
            newQuoteId: 1,
            endorsementId: 1,
            policySectionVersions: [
                {
                    quoteId: 1
                },
                {
                    endorsementId: 1,
                    quoteId: 2
                }
            ],
            showComparator: true,
            openEndorsement: null,
            exitEndorsementMode: null
        });
    }

    beforeEach(() => {
        angular.mock.module('app', function ($provide) {
            $provide.constant('baseUrl', 'THE_SERVER_URL');
            $provide.service('quoteComparatorService', function ($q) {
                quoteComparatorServiceMock = {
                    compareQuotes: jest.fn().mockReturnValue(
                        $q.when({
                        data: [
                            {
                                section: 'section',
                                label: 'label',
                                field: 'field',
                                oldValue: 'oldValue',
                                newValue: 'newValue',
                                kindOfObject: 'kindOfObject',
                                fieldType: 'fieldType',
                                differences: []
                            }
                        ]})
                    ),
                }

                return quoteComparatorServiceMock;
            });
        });
    });

    beforeEach(inject(function (_$rootScope_, _$compile_, _$controller_) {
        $compile = _$compile_;
        $rootScope = setupScopeProperties(_$rootScope_);
        ctrl = _$controller_;
        $scope = $rootScope.$new();
    }));

    function createElement() {
        return $compile(
          `<policy-section-version-comparator
            link-float-right="linkFloatRight" 
            new-quote-id="newQuoteId" 
            policy-section-versions="policySectionVersions"
            show-comparator="showComparator"
            endorsement-id="endorsementId" 
            open-endorsement="openEndorsement"
            exit-endorsement-mode="exitEndorsementMode"></policy-section-version-comparator>`
        )($scope);
    }

    test('should render the template', () => {
        const element = createElement();
        $scope.$digest();
        expect(element.html().trim().length).toBeGreaterThan(0);
    });

    describe('controller', () => {
        let ctrl;

        function getController() {
          const element = createElement();
          $scope.$digest();
          return element.controller('policySectionVersionComparator');
        }

        beforeEach(() => {
          ctrl = getController();
        });

        describe('loadComparisonData', () => {
            test('it filters new and old versions', () => {
                ctrl.loadComparisonData();
                $scope.$apply();

                expect(ctrl.newPolicySectionData).toEqual(
                    expect.objectContaining({
                        quoteId: 1
                    })
                );

                expect(ctrl.oldPolicySectionData).toEqual(
                    expect.objectContaining({
                        quoteId: 2
                    })
                );

                expect(ctrl.collapsedSections.length).toEqual(1);
            });
        });

        describe('toggleContent', () => {
            test('it toggles collapse state', () => {
                ctrl.toggleContent(0);
                $scope.$apply();

                expect(ctrl.collapsedSections[0]).toEqual(true);

                ctrl.toggleContent(0);
                $scope.$apply();

                expect(ctrl.collapsedSections[0]).toEqual(false);
            });
        });
    });
});