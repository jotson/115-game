Phaser.Filter.Scanline = function (game) {
    Phaser.Filter.call(this, game);

    this.fragmentSrc = [
        'precision lowp float;',
        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',
        'uniform sampler2D uSampler;',
        'uniform vec2 resolution;',

        'void main() {',
            'float brightness = clamp(sin(vTextureCoord.y * resolution.y * 5.0) + 0.5, 0.75, 1.0);',
            'gl_FragColor = texture2D(uSampler, vTextureCoord);',
            'gl_FragColor.rgb = mix(gl_FragColor.rgb, brightness * gl_FragColor.rgb, 1.0);',
        '}'
    ];
};

Phaser.Filter.Scanline.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.Scanline.prototype.constructor = Phaser.Filter.Scanline;
