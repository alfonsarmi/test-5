loadJsFile(`${__dirname}/../common/SearchBarDirective.js`);
loadJsFile(`${__dirname}/PolicySelectorDirective.js`);
loadJsFile(
  `${__dirname}/../common/DefaultDateFilter.js`,
  'var dateFormatGeneral="???";angular.module("app").filter("defaultDate", DefaultDateFilter);'
);
loadJsFile(`${__dirname}/PolicyLinksDirective.js`);

const { getByTestId, getAllByTestId, queryAllByTestId, fireEvent } = require('@testing-library/dom');
require('jest-dom/extend-expect');

describe('Policy.SelectorDirective', () => {
  let bootstrap;
  let $q;
  let policyServiceMock;

  beforeEach(() => {
    angular.mock.module('app', function($provide) {
      $provide.constant('baseUrl', 'THE_SERVER_URL');
      $provide.service('policyService', () => policyServiceMock);
    });

    inject(function($rootScope, $compile, _$q_) {
      $q = _$q_;

      policyServiceMock = {
        search() {
          return $q.when(searchResultMocks);
        }
      };

      bootstrap = prepareDirectiveTest(
        'policySelector',
        $rootScope,
        $compile,
        `<policy-selector
          current-policy-id="123"
          main-title="{{mainTitle}}"
          secondary-title="{{secondaryTitle}}"
          selector-button-text="{{buttonText}}"
          accept-selection-button-text="{{acceptSelectionLabel}}"
          single-selection="singleSelection"
          on-accept-selection="onAcceptSelection(selectedItems)"
          no-data-text="{{noDataText}}"
          select-policies="selectPolicies"
        ></policy-selector>`
      );
    });
  });

  test('should render the template', () => {
    const { element } = bootstrap();
    expect(element.html().trim().length).toBeGreaterThan(0);
  });

  describe('toggle slidingPanel', () => {
    test('"slidingPanelToggleButton" opens "slidingPanel"', () => {
      const { element, controller } = bootstrap();

      expect(getByTestId(element[0], 'slidingPanel').getAttribute('is-opened')).toBe('ctrl.selectorOpened');
      expect(controller.selectorOpened).toBeFalsy();
      fireEvent.click(getByTestId(element[0], 'slidingPanelToggleButton'));
      expect(controller.selectorOpened).toBeTruthy();
    });

    test('"cancelButton" closes "slidingPanel"', () => {
      const { element, controller } = bootstrap();

      expect(getByTestId(element[0], 'slidingPanel').getAttribute('is-opened')).toBe('ctrl.selectorOpened');
      expect(controller.selectorOpened).toBeFalsy();
      fireEvent.click(getByTestId(element[0], 'cancelButton'));
      expect(controller.selectorOpened).toBeTruthy();
    });

    test('"acceptSelectionButton" closes "slidingPanel"', () => {
      const { element, controller } = bootstrap();

      expect(getByTestId(element[0], 'slidingPanel').getAttribute('is-opened')).toBe('ctrl.selectorOpened');
      expect(controller.selectorOpened).toBeFalsy();
      fireEvent.click(getByTestId(element[0], 'acceptSelectionButton'));
      expect(controller.selectorOpened).toBeTruthy();
    });
  });

  describe('labels', () => {
    test('renders the "mainTitle"', () => {
      const { element } = bootstrap({
        mainTitle: 'main title test'
      });
      expect(getByTestId(element[0], 'slidingPanel').getAttribute('main-title')).toBe('main title test');
    });

    test('renders the "secondaryTitle"', () => {
      const { element } = bootstrap({
        secondaryTitle: 'secondary title test'
      });
      expect(getByTestId(element[0], 'slidingPanel').getAttribute('secondary-title')).toBe('secondary title test');
    });

    test('renders the "buttonText"', () => {
      const { element } = bootstrap({
        buttonText: 'buttonText test'
      });
      expect(getByTestId(element[0], 'slidingPanelToggleButton')).toHaveTextContent('buttonText test');
    });

    test('renders the "acceptSelectionLabel"', () => {
      const { element } = bootstrap({
        acceptSelectionLabel: 'acceptSelectionLabel test'
      });

      expect(getByTestId(element[0], 'acceptSelectionButton')).toHaveTextContent('acceptSelectionLabel test');
    });

    test('renders the "noDataText"', () => {
      const { element } = bootstrap({
        noDataText: 'Testing'
      });
      expect(getByTestId(element[0], 'searchResults').getAttribute('no-data-text')).toBe('Testing');
    });
  });

  function performSearch(element, searchTerm) {
    fireEvent.change(getByTestId(element[0], 'searchInput'), { target: { value: searchTerm } });
    fireEvent.click(getByTestId(element[0], 'searchButton'));
  }

  describe('search', () => {
    let element, $scope, resultMocks, searchDeferred;

    beforeEach(() => {
      resultMocks = [
        {
          PolicyId: 1,
          PolicyRef: 'AAA',
          PolicySections: [
            {
              PolicySectionId: 11,
              PolicyRef: 'aaa',
              SectionStatus: 'Draft',
              InceptionDate: '2019-04-05T15:48:23.367Z',
              ExpiryDate: '2019-04-06T15:48:23.367Z',
              SectionCode: '??'
            },
            {
              PolicySectionId: 111,
              PolicyRef: 'aaa2',
              SectionStatus: 'Signed',
              InceptionDate: '2019-04-05T15:48:23.367Z',
              ExpiryDate: '2019-04-06T15:48:23.367Z',
              SectionCode: '??'
            },
            {
              PolicySectionId: 1111,
              PolicyRef: 'aaa3',
              SectionStatus: 'Authorised',
              InceptionDate: '2019-04-05T15:48:23.367Z',
              ExpiryDate: '2019-04-06T15:48:23.367Z',
              SectionCode: '??'
            },
            {
              PolicySectionId: 11111,
              PolicyRef: 'aaa4',
              SectionStatus: 'Draft',
              InceptionDate: '2019-04-05T15:48:23.367Z',
              ExpiryDate: '2019-04-06T15:48:23.367Z',
              SectionCode: '??'
            }
          ],
          PolicyStatus: 'status',
          InceptionDate: '2019-04-05T15:48:23.367Z',
          ExpiryDate: '2019-04-06T15:48:23.367Z'
        },
        {
          PolicyId: 2,
          PolicyRef: 'BBB',
          PolicySections: [
            {
              PolicySectionId: 22,
              PolicyRef: 'bbb',
              SectionStatus: 'Authorised',
              InceptionDate: '2019-03-05T15:48:23.367Z',
              ExpiryDate: '2019-03-06T15:48:23.367Z',
              SectionCode: '??'
            }
          ],
          PolicyStatus: 'Authorised',
          InceptionDate: '2019-03-05T15:48:23.367Z',
          ExpiryDate: '2019-03-06T15:48:23.367Z'
        }
      ];
      searchDeferred = $q.defer();
      policyServiceMock = {
        search(currentPolicyId, term) {
          if (currentPolicyId === 123 && term.trim().length > 0) return searchDeferred.promise;
        }
      };
      ({ element, $scope } = bootstrap());
    });

    test('shows the "searchLoadingIndicator"', () => {
      const searchLoadingIndicator = getByTestId(element[0], 'searchLoadingIndicator');

      expect(searchLoadingIndicator).toHaveClass('ng-hide');

      performSearch(element, 'test');

      expect(searchLoadingIndicator).not.toHaveClass('ng-hide');

      searchDeferred.resolve(resultMocks);
      $scope.$digest();
      expect(searchLoadingIndicator).toHaveClass('ng-hide');
    });

    test('renders the results', () => {
      performSearch(element, 'test');
      searchDeferred.resolve(resultMocks);
      $scope.$apply();

      const resultsContainer = getByTestId(element[0], 'searchResults');
      const policyCards = getAllByTestId(resultsContainer, 'policyCard');
      const policySectionCards = getAllByTestId(resultsContainer, 'policySectionCard');

      expect(policyCards.length).toBe(2);
      expect(policySectionCards.length).toBe(5);
    });
  });

  describe('selection', () => {
    let element, $scope;

    beforeEach(() => {
      const resultMocks = [
        {
          PolicyId: 1,
          PolicyRef: 'AAA',
          UniqueMarketRef: 'policyA',
          PolicySections: [
            {
              PolicySectionId: 11,
              PolicyRef: 'aaa',
              UniqueMarketRef: 'sectionA',
              SectionStatus: 'Draft',
              InceptionDate: '2019-04-05T15:48:23.367Z',
              ExpiryDate: '2019-04-06T15:48:23.367Z',
              SectionCode: '??'
            },
            {
              PolicySectionId: 111,
              PolicyRef: 'aaa2',
              UniqueMarketRef: 'sectionB',
              SectionStatus: 'Signed',
              InceptionDate: '2019-04-05T15:48:23.367Z',
              ExpiryDate: '2019-04-06T15:48:23.367Z',
              SectionCode: '??'
            },
            {
              PolicySectionId: 1111,
              PolicyRef: 'aaa3',
              UniqueMarketRef: 'sectionC',
              SectionStatus: 'Authorised',
              InceptionDate: '2019-04-05T15:48:23.367Z',
              ExpiryDate: '2019-04-06T15:48:23.367Z',
              SectionCode: '??'
            },
            {
              PolicySectionId: 11111,
              PolicyRef: 'aaa4',
              UniqueMarketRef: 'sectionD',
              SectionStatus: 'Draft',
              InceptionDate: '2019-04-05T15:48:23.367Z',
              ExpiryDate: '2019-04-06T15:48:23.367Z',
              SectionCode: '??'
            }
          ],
          PolicyStatus: 'status',
          InceptionDate: '2019-04-05T15:48:23.367Z',
          ExpiryDate: '2019-04-06T15:48:23.367Z'
        },
        {
          PolicyId: 2,
          PolicyRef: 'BBB',
          UniqueMarketRef: 'bbbb',
          UniqueMarketRef: 'policyB',
          PolicySections: [
            {
              PolicySectionId: 22,
              PolicyRef: 'bbb',
              UniqueMarketRef: 'sectionE',
              SectionStatus: 'Authorised',
              InceptionDate: '2019-03-05T15:48:23.367Z',
              ExpiryDate: '2019-03-06T15:48:23.367Z',
              SectionCode: '??'
            }
          ],
          PolicyStatus: 'Authorised',
          InceptionDate: '2019-03-05T15:48:23.367Z',
          ExpiryDate: '2019-03-06T15:48:23.367Z'
        }
      ];
      searchDeferred = $q.defer();
      policyServiceMock = {
        search() {
          return $q.when(resultMocks);
        }
      };
    });

    describe('PolicySection selection mode', () => {
      beforeEach(() => {
        ({ element, $scope } = bootstrap({
          onAcceptSelection: jest.fn()
        }));
        performSearch(element, 'test');
      });

      test('it is possible to only remove PolicySections', () => {
        const resultsContainer = getByTestId(element[0], 'searchResults');
        const selectionContainer = getByTestId(element[0], 'selectedItems');

        fireEvent.click(getAllByTestId(resultsContainer, 'policySectionCard')[0]);
        fireEvent.click(getAllByTestId(resultsContainer, 'policySectionCard')[0]);

        const policySectionCardDeleteButtons = getAllByTestId(selectionContainer, 'policySectionCardDeleteButton');
        expect(policySectionCardDeleteButtons.length).toBeGreaterThanOrEqual(1);
        policySectionCardDeleteButtons.forEach(deleteButton => {
          expect(deleteButton).not.toHaveClass('ng-hide');
        });

        const policyCardDeleteButtons = getAllByTestId(selectionContainer, 'policyCardDeleteButton');
        expect(policyCardDeleteButtons.length).toBeGreaterThanOrEqual(1);
        policyCardDeleteButtons.forEach(deleteButton => {
          expect(deleteButton).toHaveClass('ng-hide');
        });
      });

      test('selects one PolicySection with its Policy', () => {
        const resultsContainer = getByTestId(element[0], 'searchResults');
        const selectionContainer = getByTestId(element[0], 'selectedItems');
        const policySectionCards = getAllByTestId(resultsContainer, 'policySectionCard');

        fireEvent.click(policySectionCards[0]);

        const selectedPolicyRefs = getAllByTestId(selectionContainer, 'policyRef');
        expect(selectedPolicyRefs.length).toBe(1);
        expect(selectedPolicyRefs[0]).toHaveTextContent('AAA');

        const selectedSectionRefs = getAllByTestId(selectionContainer, 'sectionRef');
        expect(selectedSectionRefs.length).toBe(1);
        expect(selectedSectionRefs[0]).toHaveTextContent('aaa');

        const availablePolicyRefs = getAllByTestId(resultsContainer, 'policyRef');
        expect(availablePolicyRefs.length).toBe(2);
        expect(availablePolicyRefs[0]).toHaveTextContent('AAA');
        expect(availablePolicyRefs[1]).toHaveTextContent('BBB');

        const availableSectionRefs = getAllByTestId(resultsContainer, 'sectionRef');
        expect(availableSectionRefs.length).toBe(4);
        expect(availableSectionRefs[0]).toHaveTextContent('aaa2');
        expect(availableSectionRefs[1]).toHaveTextContent('aaa3');
        expect(availableSectionRefs[2]).toHaveTextContent('aaa4');
        expect(availableSectionRefs[3]).toHaveTextContent('bbb');
      });

      test('selects multiple PolicySections for the same Policy', () => {
        const resultsContainer = getByTestId(element[0], 'searchResults');
        const selectionContainer = getByTestId(element[0], 'selectedItems');

        fireEvent.click(getAllByTestId(resultsContainer, 'policySectionCard')[0]);
        fireEvent.click(getAllByTestId(resultsContainer, 'policySectionCard')[0]);

        const selectedPolicyRefs = getAllByTestId(selectionContainer, 'policyRef');
        expect(selectedPolicyRefs.length).toBe(1);
        expect(selectedPolicyRefs[0]).toHaveTextContent('AAA');

        const selectedSectionRefs = getAllByTestId(selectionContainer, 'sectionRef');
        expect(selectedSectionRefs.length).toBe(2);
        expect(selectedSectionRefs[0]).toHaveTextContent('aaa');
        expect(selectedSectionRefs[1]).toHaveTextContent('aaa2');

        const availablePolicyRefs = getAllByTestId(resultsContainer, 'policyRef');
        expect(availablePolicyRefs.length).toBe(2);
        expect(availablePolicyRefs[0]).toHaveTextContent('AAA');
        expect(availablePolicyRefs[1]).toHaveTextContent('BBB');

        const availableSectionRefs = getAllByTestId(resultsContainer, 'sectionRef');
        expect(availableSectionRefs.length).toBe(3);
        expect(availableSectionRefs[0]).toHaveTextContent('aaa3');
        expect(availableSectionRefs[1]).toHaveTextContent('aaa4');
        expect(availableSectionRefs[2]).toHaveTextContent('bbb');
      });

      test('unselected PolicySection returns to the result list', () => {
        const resultsContainer = getByTestId(element[0], 'searchResults');
        const selectionContainer = getByTestId(element[0], 'selectedItems');

        fireEvent.click(getAllByTestId(resultsContainer, 'policySectionCard')[0]);
        fireEvent.click(getAllByTestId(resultsContainer, 'policySectionCard')[0]);
        fireEvent.click(getAllByTestId(selectionContainer, 'policySectionCardDeleteButton')[0]);

        const selectedPolicyRefs = getAllByTestId(selectionContainer, 'policyRef');
        expect(selectedPolicyRefs.length).toBe(1);
        expect(selectedPolicyRefs[0]).toHaveTextContent('AAA');

        const selectedSectionRefs = getAllByTestId(selectionContainer, 'sectionRef');
        expect(selectedSectionRefs.length).toBe(1);
        expect(selectedSectionRefs[0]).toHaveTextContent('aaa2');

        const availablePolicyRefs = getAllByTestId(resultsContainer, 'policyRef');
        expect(availablePolicyRefs.length).toBe(2);
        expect(availablePolicyRefs[0]).toHaveTextContent('AAA');
        expect(availablePolicyRefs[1]).toHaveTextContent('BBB');

        const availableSectionRefs = getAllByTestId(resultsContainer, 'sectionRef');
        expect(availableSectionRefs.length).toBe(4);
        expect(availableSectionRefs[0]).toHaveTextContent('aaa');
        expect(availableSectionRefs[1]).toHaveTextContent('aaa3');
        expect(availableSectionRefs[2]).toHaveTextContent('aaa4');
        expect(availableSectionRefs[3]).toHaveTextContent('bbb');
      });

      test('selects multiple PolicySections for different Policies', () => {
        const resultsContainer = getByTestId(element[0], 'searchResults');
        const selectionContainer = getByTestId(element[0], 'selectedItems');

        fireEvent.click(getAllByTestId(resultsContainer, 'policySectionCard')[0]);
        fireEvent.click(getAllByTestId(resultsContainer, 'policySectionCard')[3]);

        const selectedPolicyRefs = getAllByTestId(selectionContainer, 'policyRef');
        expect(selectedPolicyRefs.length).toBe(2);
        expect(selectedPolicyRefs[0]).toHaveTextContent('AAA');
        expect(selectedPolicyRefs[1]).toHaveTextContent('BBB');

        const selectedSectionRefs = getAllByTestId(selectionContainer, 'sectionRef');
        expect(selectedSectionRefs.length).toBe(2);
        expect(selectedSectionRefs[0]).toHaveTextContent('aaa');
        expect(selectedSectionRefs[1]).toHaveTextContent('bbb');

        const availablePolicyRefs = getAllByTestId(resultsContainer, 'policyRef');
        expect(availablePolicyRefs.length).toBe(1);
        expect(availablePolicyRefs[0]).toHaveTextContent('AAA');

        const availableSectionRefs = getAllByTestId(resultsContainer, 'sectionRef');
        expect(availableSectionRefs.length).toBe(3);
        expect(availableSectionRefs[0]).toHaveTextContent('aaa2');
        expect(availableSectionRefs[1]).toHaveTextContent('aaa3');
        expect(availableSectionRefs[2]).toHaveTextContent('aaa4');
      });

      test('selects only a single PolicySection when "singleSelection" is true', () => {
        $scope.singleSelection = true;

        const resultsContainer = getByTestId(element[0], 'searchResults');
        const selectionContainer = getByTestId(element[0], 'selectedItems');

        fireEvent.click(getAllByTestId(resultsContainer, 'policySectionCard')[0]);
        fireEvent.click(getAllByTestId(resultsContainer, 'policySectionCard')[0]);

        const selectedPolicyRefs = getAllByTestId(selectionContainer, 'policyRef');
        expect(selectedPolicyRefs.length).toBe(1);
        expect(selectedPolicyRefs[0]).toHaveTextContent('AAA');

        const selectedSectionRefs = getAllByTestId(selectionContainer, 'sectionRef');
        expect(selectedSectionRefs.length).toBe(1);
        expect(selectedSectionRefs[0]).toHaveTextContent('aaa2');

        const availablePolicyRefs = getAllByTestId(resultsContainer, 'policyRef');
        expect(availablePolicyRefs.length).toBe(2);
        expect(availablePolicyRefs[0]).toHaveTextContent('AAA');
        expect(availablePolicyRefs[1]).toHaveTextContent('BBB');

        const availableSectionRefs = getAllByTestId(resultsContainer, 'sectionRef');
        expect(availableSectionRefs.length).toBe(4);
        expect(availableSectionRefs[0]).toHaveTextContent('aaa');
        expect(availableSectionRefs[1]).toHaveTextContent('aaa3');
        expect(availableSectionRefs[2]).toHaveTextContent('aaa4');
        expect(availableSectionRefs[3]).toHaveTextContent('bbb');
      });

      test('calls "onAcceptSelection" with selected items when clicking "acceptSelectionButton"', () => {
        const resultsContainer = getByTestId(element[0], 'searchResults');

        fireEvent.click(getAllByTestId(resultsContainer, 'policySectionCard')[0]);
        fireEvent.click(getAllByTestId(resultsContainer, 'policySectionCard')[3]);
        fireEvent.click(getByTestId(element[0], 'acceptSelectionButton'));

        expect($scope.onAcceptSelection).toHaveBeenCalledTimes(1);
        expect($scope.onAcceptSelection).toHaveBeenCalledWith([
          expect.objectContaining({
            UniqueMarketRef: 'policyA',
            PolicySections: [
              expect.objectContaining({
                UniqueMarketRef: 'sectionA'
              })
            ]
          }),
          expect.objectContaining({
            UniqueMarketRef: 'policyB',
            PolicySections: [
              expect.objectContaining({
                UniqueMarketRef: 'sectionE'
              })
            ]
          })
        ]);
      });
    });

    describe('Policy selection mode', () => {
      beforeEach(() => {
        ({ element, $scope } = bootstrap({
          onAcceptSelection: jest.fn(),
          selectPolicies: true
        }));
        performSearch(element, 'test');
      });

      test('it is possible to only remove Policies', () => {
        const resultsContainer = getByTestId(element[0], 'searchResults');
        const selectionContainer = getByTestId(element[0], 'selectedItems');

        fireEvent.click(getAllByTestId(resultsContainer, 'policyCard')[0]);
        fireEvent.click(getAllByTestId(resultsContainer, 'policyCard')[0]);

        const policySectionCardDeleteButtons = getAllByTestId(selectionContainer, 'policySectionCardDeleteButton');
        expect(policySectionCardDeleteButtons.length).toBeGreaterThanOrEqual(1);
        policySectionCardDeleteButtons.forEach(deleteButton => {
          expect(deleteButton).toHaveClass('ng-hide');
        });

        const policyCardDeleteButtons = getAllByTestId(selectionContainer, 'policyCardDeleteButton');
        expect(policyCardDeleteButtons.length).toBeGreaterThanOrEqual(1);
        policyCardDeleteButtons.forEach(deleteButton => {
          expect(deleteButton).not.toHaveClass('ng-hide');
        });
      });

      test('selects multiple Policies', () => {
        const resultsContainer = getByTestId(element[0], 'searchResults');
        const selectionContainer = getByTestId(element[0], 'selectedItems');

        fireEvent.click(getAllByTestId(resultsContainer, 'policyCard')[0]);
        fireEvent.click(getAllByTestId(resultsContainer, 'policyCard')[0]);

        const selectedPolicyRefs = getAllByTestId(selectionContainer, 'policyRef');
        expect(selectedPolicyRefs.length).toBe(2);
        expect(selectedPolicyRefs[0]).toHaveTextContent('AAA');
        expect(selectedPolicyRefs[1]).toHaveTextContent('BBB');

        const selectedSectionRefs = getAllByTestId(selectionContainer, 'sectionRef');
        expect(selectedSectionRefs.length).toBe(5);
        expect(selectedSectionRefs[0]).toHaveTextContent('aaa');
        expect(selectedSectionRefs[1]).toHaveTextContent('aaa2');
        expect(selectedSectionRefs[2]).toHaveTextContent('aaa3');
        expect(selectedSectionRefs[3]).toHaveTextContent('aaa4');
        expect(selectedSectionRefs[4]).toHaveTextContent('bbb');

        expect(queryAllByTestId(resultsContainer, 'policyCard').length).toBe(0);
      });

      test('unselected Policy returns to the result list', () => {
        const resultsContainer = getByTestId(element[0], 'searchResults');
        const selectionContainer = getByTestId(element[0], 'selectedItems');

        fireEvent.click(getAllByTestId(resultsContainer, 'policyCard')[0]);
        fireEvent.click(getAllByTestId(resultsContainer, 'policyCard')[0]);
        fireEvent.click(getAllByTestId(selectionContainer, 'policyCardDeleteButton')[0]);

        const selectedPolicyRefs = getAllByTestId(selectionContainer, 'policyRef');
        expect(selectedPolicyRefs.length).toBe(1);
        expect(selectedPolicyRefs[0]).toHaveTextContent('BBB');

        const selectedSectionRefs = getAllByTestId(selectionContainer, 'sectionRef');
        expect(selectedSectionRefs.length).toBe(1);
        expect(selectedSectionRefs[0]).toHaveTextContent('bbb');

        const availablePolicyRefs = getAllByTestId(resultsContainer, 'policyRef');
        expect(availablePolicyRefs.length).toBe(1);
        expect(availablePolicyRefs[0]).toHaveTextContent('AAA');

        const availableSectionRefs = getAllByTestId(resultsContainer, 'sectionRef');
        expect(availableSectionRefs.length).toBe(4);
        expect(availableSectionRefs[0]).toHaveTextContent('aaa');
        expect(availableSectionRefs[1]).toHaveTextContent('aaa2');
        expect(availableSectionRefs[2]).toHaveTextContent('aaa3');
        expect(availableSectionRefs[3]).toHaveTextContent('aaa4');
      });

      test('selects only a single Policy when "singleSelection" is true', () => {
        $scope.singleSelection = true;

        const resultsContainer = getByTestId(element[0], 'searchResults');
        const selectionContainer = getByTestId(element[0], 'selectedItems');

        fireEvent.click(getAllByTestId(resultsContainer, 'policyCard')[0]);
        fireEvent.click(getAllByTestId(resultsContainer, 'policyCard')[0]);

        const selectedPolicyRefs = getAllByTestId(selectionContainer, 'policyRef');
        expect(selectedPolicyRefs.length).toBe(1);
        expect(selectedPolicyRefs[0]).toHaveTextContent('BBB');

        const selectedSectionRefs = getAllByTestId(selectionContainer, 'sectionRef');
        expect(selectedSectionRefs.length).toBe(1);
        expect(selectedSectionRefs[0]).toHaveTextContent('bbb');

        const availablePolicyRefs = getAllByTestId(resultsContainer, 'policyRef');
        expect(availablePolicyRefs.length).toBe(1);
        expect(availablePolicyRefs[0]).toHaveTextContent('AAA');

        const availableSectionRefs = getAllByTestId(resultsContainer, 'sectionRef');
        expect(availableSectionRefs.length).toBe(4);
        expect(availableSectionRefs[0]).toHaveTextContent('aaa');
        expect(availableSectionRefs[1]).toHaveTextContent('aaa2');
        expect(availableSectionRefs[2]).toHaveTextContent('aaa3');
        expect(availableSectionRefs[3]).toHaveTextContent('aaa4');
      });

      test('calls "onAcceptSelection" with selected items when clicking "acceptSelectionButton"', () => {
        const resultsContainer = getByTestId(element[0], 'searchResults');

        fireEvent.click(getAllByTestId(resultsContainer, 'policyCard')[0]);
        fireEvent.click(getAllByTestId(resultsContainer, 'policyCard')[0]);
        fireEvent.click(getByTestId(element[0], 'acceptSelectionButton'));

        expect($scope.onAcceptSelection).toHaveBeenCalledTimes(1);
        expect($scope.onAcceptSelection).toHaveBeenCalledWith([
          expect.objectContaining({
            UniqueMarketRef: 'policyA',
            PolicySections: [
              expect.objectContaining({
                UniqueMarketRef: 'sectionA'
              }),
              expect.objectContaining({
                UniqueMarketRef: 'sectionB'
              }),
              expect.objectContaining({
                UniqueMarketRef: 'sectionC'
              }),
              expect.objectContaining({
                UniqueMarketRef: 'sectionD'
              })
            ]
          }),
          expect.objectContaining({
            UniqueMarketRef: 'policyB',
            PolicySections: [
              expect.objectContaining({
                UniqueMarketRef: 'sectionE'
              })
            ]
          })
        ]);
      });
    });
  });
});
