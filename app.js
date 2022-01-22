const { Container, Draggable } = VueDndrop;

Pusher.logToConsole = true;

const pusher = new Pusher('8494862854057be56f26', {
  cluster: 'eu',
  authEndpoint:
    'https://0qwey1wi17.execute-api.eu-central-1.amazonaws.com/prod/pusher/auth',
});

const channel = pusher.subscribe('private-deck-of-cards');

channel.bind('client-page-changed', function ({ pageIndex }) {
  app.activePage = pageIndex;
});

channel.bind('client-cards-order-changed', function ({ pageIndex, cards }) {
  app.pages[pageIndex] = cards;
  app.$forceUpdate();
});

const app = new Vue({
  el: '#app',
  data: {
    activePage: 0,
    pages: [
      [
        { id: 'p1', title: 'Challenging Tasks' },
        { id: 'p2', title: 'Diversity' },
        { id: 'p3', title: 'Teamwork' },
        { id: 'p4', title: 'Autonomy' },
      ],
      [
        { id: 'n1', title: 'Routine' },
        { id: 'n2', title: 'Stress and Overload' },
        { id: 'n3', title: 'Unclear Requirements' },
        { id: 'n4', title: 'Micro-Management' },
        { id: 'n5', title: 'Lack of Transparency' },
        { id: 'n6', title: 'Toxicity' },
      ],
      [
        { id: 'r1', title: 'Open Source' },
        { id: 'r2', title: 'Mentoring' },
        { id: 'r3', title: 'Testing' },
        { id: 'r4', title: 'Clean Code' },
        { id: 'r5', title: 'Architecture' },
        { id: 'r6', title: 'Leverage' },
      ],
    ],
  },
  computed: {
    numberOfPages: function () {
      return this.pages.length;
    },
  },
  components: { Container, Draggable },
  methods: {
    onDrop(dropResult) {
      console.log('drop', dropResult);

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
    changePage(delta) {
      this.activePage += delta;
      channel.trigger('client-page-changed', { pageIndex: this.activePage });
    },
  },
});
