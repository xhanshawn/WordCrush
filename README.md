# WordCrush

Fun and classic word game.

Motivation: I saw people played this game in the subway, and one of my friends got a similar project topic. Also, I'd like to learn more about js, and then I decided to build this. By now, it is a static page. But I am planning to make a cdn link or a ruby gem to make people easy to import. Maybe people who build education-related pages wants to import this game. Enjoy it anyway.

## Installation

Download the page and demo it.

    $ git clone https://github.com/xhanshawn/WordCrush.git

## Usage

Import javascript file:

    <script type="text/javascript" src="https://cdn.rawgit.com/xhanshawn/WordCrush/master/wordcrush-0.1.js"></script>

Import Stylesheet:

    <link rel="stylesheet" href="https://cdn.rawgit.com/xhanshawn/WordCrush/master/wordcrush.css">

Then call wordcrush() function to insert a wordcrush in the element:

      $('some-div').wordcrush();

The game will show up in that div.

Options:

*Size:

    You can customize the size of the play panel, for example:
      `$('some-div').wordcrush({
            size: 5
       });`
    Then it will generate a 5 X 5 play panel.
    size from 4 to 7 now are accecpted.

*Theme:

    You can use theme option, for example
      `$('some-div').wordcrush({
            theme: "pink"
       });`
    Then it will create a play panel with theme with pink color. Default is pink. 
    Now there are pink, blue and Halloween themes available.


## Development

Do whatever you want.

## Contributing

I appreciate all the feedbacks.
