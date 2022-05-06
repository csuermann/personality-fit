const { Container, Draggable } = VueDndrop;

Pusher.logToConsole = false;

const pusher = new Pusher('8494862854057be56f26', {
  cluster: 'eu',
  authEndpoint:
    'https://0qwey1wi17.execute-api.eu-central-1.amazonaws.com/prod/pusher/auth',
});

const match = window.location.href.match(/\?session=(\d{4,7})/);

if (!match) {
  window.location.href += `?session=${Math.ceil(Math.random() * 1000000)}`;
} else {
  sessionId = match[1];
}

const channel = pusher.subscribe(`private-deck-of-cards-${sessionId}`);

channel.bind('client-page-changed', function ({ pageIndex }) {
  app.activePage = pageIndex;
});

channel.bind('client-cards-order-changed', function ({ pageIndex, cards }) {
  app.pages[pageIndex] = cards;
  app.$forceUpdate();
});

channel.bind('client-card-selected', function ({ cardId }) {
  app.selectedCard = cardId;
});

const app = new Vue({
  el: '#app',
  data: {
    activePage: 0,
    selectedCard: 'p0',
    options: [
      { text: 'please wait', value: 0 },
      { text: 'positive aspects', value: 1 },
      { text: 'negative aspects', value: 2 },
      { text: 'engineering role', value: 3 },
      { text: 'staff engineering role', value: 4 },
      { text: 'devops engineering role', value: 5 },
    ],
    pages: [
      [{ id: 'c0', title: 'please wait...' }],
      [
        { id: 'p1', title: 'Challenging Tasks' },
        { id: 'p2', title: 'Diversity' },
        { id: 'p3', title: 'Teamwork' },
        { id: 'p4', title: 'Autonomy' },
        { id: 'p5', title: 'Growth' },
      ],
      [
        { id: 'n1', title: 'Routine' },
        { id: 'n2', title: 'Stress and Overload' },
        { id: 'n3', title: 'Unclear Requirements' },
        { id: 'n4', title: 'Micro-Management' },
        { id: 'n5', title: 'Lack of Transparency' },
      ],
      [
        { id: 'er1', title: 'Open Source' },
        { id: 'er2', title: 'Mentoring' },
        { id: 'er3', title: 'Testing' },
        { id: 'er4', title: 'Clean Code' },
        { id: 'er5', title: 'Tech Debt' },
        { id: 'er6', title: 'Architecture' },
      ],
      [
        { id: 'ser1', title: 'Mentoring' },
        { id: 'ser2', title: 'Testing' },
        { id: 'ser3', title: 'Clean Code' },
        { id: 'ser4', title: 'Tech Debt' },
        { id: 'ser5', title: 'Architecture' },
        { id: 'ser6', title: 'Leverage' },
        { id: 'ser7', title: 'Innovation' },
      ],
      [
        { id: 'do1', title: 'Automation' },
        { id: 'do2', title: 'CI/CD' },
        { id: 'do3', title: 'Collaboration' },
        { id: 'do4', title: 'Continuous improvement' },
        { id: 'do5', title: 'Monitoring' },
        { id: 'do6', title: 'SLA' },
      ],
    ],
  },
  computed: {
    numberOfPages: function () {
      return this.pages.length;
    },
    classObject: function () {
      return {};
    },
  },
  components: { Container, Draggable },
  methods: {
    onDragStart({ payload }) {
      const { cardId } = payload;
      channel.trigger('client-card-selected', {
        cardId,
      });
    },
    onDrop(dropResult) {
      this.pages[this.activePage] = applyDrag(
        this.pages[this.activePage],
        dropResult
      );
      this.$forceUpdate();

      channel.trigger('client-cards-order-changed', {
        pageIndex: this.activePage,
        cards: this.pages[this.activePage],
      });
    },
    isAdmin() {
      return window.location.href.includes('admin');
    },
    changePage() {
      channel.trigger('client-page-changed', { pageIndex: this.activePage });
    },
    // changePage(delta) {
    //   this.activePage += delta;
    //   channel.trigger('client-page-changed', { pageIndex: this.activePage });
    // },
    getChildPayload(index) {
      return {
        pageIndex: this.activePage,
        cardIndex: index,
        cardId: this.pages[this.activePage][index].id,
      };
    },
  },
});
